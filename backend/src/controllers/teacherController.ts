import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { generateTeacherId, getTeacherByUserId } from '../services/teacherService';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const POPULATE_ASSIGNED = [
  { path: 'assignedClasses.class', select: 'name' },
  { path: 'assignedClasses.section', select: 'name' },
  { path: 'assignedClasses.academicYear', select: 'name' },
];

// GET /api/teachers
export const getTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.search) {
      const s = (req.query.search as string).trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { teacherId: { $regex: s, $options: 'i' } },
        { department: { $regex: s, $options: 'i' } },
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = { $regex: req.query.department as string, $options: 'i' };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate(POPULATE_ASSIGNED)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    sendSuccess(res, 'Teachers fetched successfully', teachers, 200, {
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/teachers
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const existing = await Teacher.findOne({ email });
    if (existing) throw new AppError('A teacher with this email already exists', 409);

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('A user with this email already exists', 409);

    const user = await User.create({ name: req.body.name.trim(), email, password: req.body.password, role: 'TEACHER' });

    const teacherId = await generateTeacherId();
    const { password: _, ...teacherData } = req.body;
    const teacher = await Teacher.create({ ...teacherData, teacherId, user: user._id });
    const populated = await teacher.populate(POPULATE_ASSIGNED);

    sendSuccess(res, 'Teacher created successfully', populated, 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/:id
export const getTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid teacher ID', 400);

    const teacher = await Teacher.findById(id).populate(POPULATE_ASSIGNED);
    if (!teacher) throw new AppError('Teacher not found', 404);

    sendSuccess(res, 'Teacher fetched successfully', teacher);
  } catch (err) {
    next(err);
  }
};

// PUT /api/teachers/:id
export const updateTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid teacher ID', 400);

    delete req.body.teacherId;

    if (req.body.email) {
      const conflict = await Teacher.findOne({
        email: req.body.email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (conflict) throw new AppError('Email already in use by another teacher', 409);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate(POPULATE_ASSIGNED);

    if (!teacher) throw new AppError('Teacher not found', 404);

    sendSuccess(res, 'Teacher updated successfully', teacher);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/teachers/:id
export const deleteTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid teacher ID', 400);

    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) throw new AppError('Teacher not found', 404);

    if (teacher.user) await User.findByIdAndDelete(teacher.user);

    sendSuccess(res, 'Teacher deleted successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/me/classes  — teacher sees only their assigned classes
export const getMyClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);

    const populated = await teacher.populate(POPULATE_ASSIGNED);
    sendSuccess(res, 'Assigned classes fetched successfully', populated.assignedClasses);
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/me/students  — teacher sees only students in their assigned classes
export const getMyStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);

    if (teacher.assignedClasses.length === 0) {
      sendSuccess(res, 'No assigned classes', [], 200, { total: 0, page: 1, limit: 20, totalPages: 0 });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    // Build class+section filter from teacher's assignments
    const classIds = teacher.assignedClasses.map((ac) => ac.class);
    const filter: Record<string, unknown> = { class: { $in: classIds } };

    if (req.query.search) {
      const s = (req.query.search as string).trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
      ];
    }
    if (req.query.class && mongoose.Types.ObjectId.isValid(req.query.class as string)) {
      const requestedClass = new mongoose.Types.ObjectId(req.query.class as string);
      const isAssigned = classIds.some((c) => c.equals(requestedClass));
      if (!isAssigned) throw new AppError('You are not authorized to view this class', 403);
      filter.class = requestedClass;
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate([
          { path: 'class', select: 'name' },
          { path: 'section', select: 'name' },
          { path: 'academicYear', select: 'name' },
        ])
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    sendSuccess(res, 'Students fetched successfully', students, 200, {
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/me/profile
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);

    const populated = await teacher.populate(POPULATE_ASSIGNED);
    sendSuccess(res, 'Profile fetched successfully', populated);
  } catch (err) {
    next(err);
  }
};

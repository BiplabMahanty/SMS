import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { generateStudentId } from '../services/studentService';
import { getTeacherByUserId } from '../services/teacherService';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const POPULATE_FIELDS = [
  { path: 'academicYear', select: 'name' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'parent', select: 'name email phone' },
];

// GET /api/students
export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Teachers can only see students in their assigned classes
    if (req.user!.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user!.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      if (teacher.assignedClasses.length === 0) {
        sendSuccess(res, 'Students fetched successfully', [], 200, { total: 0, page: 1, limit, totalPages: 0 });
        return;
      }
      const classIds = teacher.assignedClasses.map((ac) => ac.class);
      filter.class = { $in: classIds };
    }

    // Search across name, email, studentId
    if (req.query.search) {
      const search = (req.query.search as string).trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academicYear && mongoose.Types.ObjectId.isValid(req.query.academicYear as string)) {
      filter.academicYear = new mongoose.Types.ObjectId(req.query.academicYear as string);
    }
    if (req.query.class && mongoose.Types.ObjectId.isValid(req.query.class as string)) {
      filter.class = new mongoose.Types.ObjectId(req.query.class as string);
    }
    if (req.query.section && mongoose.Types.ObjectId.isValid(req.query.section as string)) {
      filter.section = new mongoose.Types.ObjectId(req.query.section as string);
    }
    if (req.query.gender) filter.gender = req.query.gender;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate(POPULATE_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    sendSuccess(
      res,
      'Students fetched successfully',
      students,
      200,
      { total, page, limit, totalPages: Math.ceil(total / limit) }
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/students
export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const existing = await Student.findOne({ email });
    if (existing) throw new AppError('A student with this email already exists', 409);

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('A user with this email already exists', 409);

    const user = await User.create({ name: req.body.name.trim(), email, password: req.body.password, role: 'STUDENT' });

    const studentId = await generateStudentId();
    const { password: _, ...studentData } = req.body;
    const student = await Student.create({ ...studentData, studentId, user: user._id });
    const populated = await student.populate(POPULATE_FIELDS);

    sendSuccess(res, 'Student created successfully', populated, 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
export const getStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid student ID', 400);
    }

    const student = await Student.findById(id).populate(POPULATE_FIELDS);
    if (!student) throw new AppError('Student not found', 404);

    // Teachers can only view students in their assigned classes
    if (req.user!.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user!.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classIds = teacher.assignedClasses.map((ac) => ac.class.toString());
      if (!classIds.includes(student.class.toString())) {
        throw new AppError('You are not authorized to view this student', 403);
      }
    }

    sendSuccess(res, 'Student fetched successfully', student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid student ID', 400);
    }

    // Prevent studentId from being changed
    delete req.body.studentId;

    if (req.body.email) {
      const conflict = await Student.findOne({
        email: req.body.email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (conflict) throw new AppError('Email already in use by another student', 409);
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate(POPULATE_FIELDS);

    if (!student) throw new AppError('Student not found', 404);

    sendSuccess(res, 'Student updated successfully', student);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/my-children  (PARENT)
export const getMyChildren = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const children = await Student.find({ parent: req.user!.userId })
      .populate(POPULATE_FIELDS)
      .lean();
    sendSuccess(res, 'Children fetched successfully', children);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id
export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid student ID', 400);
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) throw new AppError('Student not found', 404);

    if (student.user) await User.findByIdAndDelete(student.user);

    sendSuccess(res, 'Student deleted successfully');
  } catch (err) {
    next(err);
  }
};

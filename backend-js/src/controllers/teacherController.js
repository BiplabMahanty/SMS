const mongoose = require('mongoose');
const { Teacher } = require('../models/Teacher');
const { Student } = require('../models/Student');
const { User } = require('../models/User');
const { generateTeacherId, getTeacherByUserId } = require('../services/teacherService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const POPULATE_ASSIGNED = [
  { path: 'assignedClasses.class', select: 'name icon' },
  { path: 'assignedClasses.section', select: 'name' },
  { path: 'assignedClasses.academicYear', select: 'name isCurrent' },
];

const getTeachers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = {};

    if (req.query.search) {
      const s = req.query.search.trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { teacherId: { $regex: s, $options: 'i' } },
        { department: { $regex: s, $options: 'i' } },
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = { $regex: req.query.department, $options: 'i' };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter).populate(POPULATE_ASSIGNED).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Teacher.countDocuments(filter),
    ]);
    sendSuccess(res, 'Teachers fetched successfully', teachers, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const createTeacher = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    if (await Teacher.findOne({ email })) throw new AppError('A teacher with this email already exists', 409);
    if (await User.findOne({ email })) throw new AppError('A user with this email already exists', 409);

    const user = await User.create({ name: req.body.name.trim(), email, password: req.body.password, role: 'TEACHER', profileImage: req.body.profileImage });
    const teacherId = await generateTeacherId();
    const { password: _, ...teacherData } = req.body;
    const teacher = await Teacher.create({ ...teacherData, teacherId, user: user._id });
    const populated = await teacher.populate(POPULATE_ASSIGNED);
    sendSuccess(res, 'Teacher created successfully', populated, 201);
  } catch (err) { next(err); }
};

const getTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid teacher ID', 400);
    const teacher = await Teacher.findById(req.params.id).populate(POPULATE_ASSIGNED);
    if (!teacher) throw new AppError('Teacher not found', 404);
    sendSuccess(res, 'Teacher fetched successfully', teacher);
  } catch (err) { next(err); }
};

const updateTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid teacher ID', 400);
    delete req.body.teacherId;

    if (req.body.email) {
      const conflict = await Teacher.findOne({ email: req.body.email.trim().toLowerCase(), _id: { $ne: req.params.id } });
      if (conflict) throw new AppError('Email already in use by another teacher', 409);
    }
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE_ASSIGNED);
    if (!teacher) throw new AppError('Teacher not found', 404);
    sendSuccess(res, 'Teacher updated successfully', teacher);
  } catch (err) { next(err); }
};

const deleteTeacher = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid teacher ID', 400);
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) throw new AppError('Teacher not found', 404);
    if (teacher.user) await User.findByIdAndDelete(teacher.user);
    sendSuccess(res, 'Teacher deleted successfully');
  } catch (err) { next(err); }
};

const getMyClasses = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);
    const populated = await teacher.populate(POPULATE_ASSIGNED);
    const activeClasses = populated.assignedClasses.filter(
      (ac) => ac.class && ac.academicYear?.isCurrent === true
    );
    sendSuccess(res, 'Assigned classes fetched successfully', activeClasses);
  } catch (err) { next(err); }
};

const getMyStudents = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);
    const populated = await teacher.populate(POPULATE_ASSIGNED);
    const activeAssigned = populated.assignedClasses.filter(
      (ac) => ac.class && ac.academicYear?.isCurrent === true
    );
    if (activeAssigned.length === 0) {
      sendSuccess(res, 'No assigned classes', [], 200, { total: 0, page: 1, limit: 20, totalPages: 0 });
      return;
    }
    const classIds = activeAssigned.map((ac) => ac.class._id ?? ac.class);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = { class: { $in: classIds } };

    if (req.query.search) {
      const s = req.query.search.trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
      ];
    }
    if (req.query.class && mongoose.Types.ObjectId.isValid(req.query.class)) {
      const requestedClass = new mongoose.Types.ObjectId(req.query.class);
      if (!classIds.some((c) => c.equals(requestedClass))) throw new AppError('You are not authorized to view this class', 403);
      filter.class = requestedClass;
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate([{ path: 'class', select: 'name' }, { path: 'section', select: 'name' }, { path: 'academicYear', select: 'name' }])
        .sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);
    sendSuccess(res, 'Students fetched successfully', students, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found for this account', 404);
    const populated = await teacher.populate(POPULATE_ASSIGNED);
    sendSuccess(res, 'Profile fetched successfully', populated);
  } catch (err) { next(err); }
};

module.exports = { getTeachers, createTeacher, getTeacher, updateTeacher, deleteTeacher, getMyClasses, getMyStudents, getMyProfile };

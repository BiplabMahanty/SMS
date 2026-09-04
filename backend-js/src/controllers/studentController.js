const mongoose = require('mongoose');
const { Student } = require('../models/Student');
const { User } = require('../models/User');
const { generateStudentId } = require('../services/studentService');
const { getTeacherByUserId } = require('../services/teacherService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

const POPULATE_FIELDS = [
  { path: 'academicYear', select: 'name' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'parent', select: 'name email phone' },
];

const getStudents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = {};

    if (req.user.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      if (teacher.assignedClasses.length === 0) {
        sendSuccess(res, 'Students fetched successfully', [], 200, { total: 0, page: 1, limit, totalPages: 0 });
        return;
      }
      filter.class = { $in: teacher.assignedClasses.map((ac) => ac.class) };
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academicYear && mongoose.Types.ObjectId.isValid(req.query.academicYear))
      filter.academicYear = new mongoose.Types.ObjectId(req.query.academicYear);
    if (req.query.class && mongoose.Types.ObjectId.isValid(req.query.class))
      filter.class = new mongoose.Types.ObjectId(req.query.class);
    if (req.query.section && mongoose.Types.ObjectId.isValid(req.query.section))
      filter.section = new mongoose.Types.ObjectId(req.query.section);
    if (req.query.gender) filter.gender = req.query.gender;

    const [students, total] = await Promise.all([
      Student.find(filter).populate(POPULATE_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);
    sendSuccess(res, 'Students fetched successfully', students, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const createStudent = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    if (await Student.findOne({ email })) throw new AppError('A student with this email already exists', 409);
    if (await User.findOne({ email })) throw new AppError('A user with this email already exists', 409);

    const user = await User.create({ name: req.body.name.trim(), email, password: req.body.password, role: 'STUDENT', profileImage: req.body.profileImage });
    const studentId = await generateStudentId();
    const { password: _, ...studentData } = req.body;
    const student = await Student.create({ ...studentData, studentId, user: user._id });
    const populated = await student.populate(POPULATE_FIELDS);
    sendSuccess(res, 'Student created successfully', populated, 201);
  } catch (err) { next(err); }
};

const getStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid student ID', 400);
    const student = await Student.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!student) throw new AppError('Student not found', 404);

    if (req.user.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      const classIds = teacher.assignedClasses.map((ac) => ac.class.toString());
      if (!classIds.includes(student.class.toString())) throw new AppError('You are not authorized to view this student', 403);
    }
    sendSuccess(res, 'Student fetched successfully', student);
  } catch (err) { next(err); }
};

const updateStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid student ID', 400);
    delete req.body.studentId;

    if (req.body.email) {
      const conflict = await Student.findOne({ email: req.body.email.trim().toLowerCase(), _id: { $ne: req.params.id } });
      if (conflict) throw new AppError('Email already in use by another student', 409);
    }
    const student = await Student.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE_FIELDS);
    if (!student) throw new AppError('Student not found', 404);
    sendSuccess(res, 'Student updated successfully', student);
  } catch (err) { next(err); }
};

const getMyChildren = async (req, res, next) => {
  try {
    const children = await Student.find({ parent: req.user.userId }).populate(POPULATE_FIELDS).lean();
    sendSuccess(res, 'Children fetched successfully', children);
  } catch (err) { next(err); }
};

const deleteStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid student ID', 400);
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) throw new AppError('Student not found', 404);
    if (student.user) await User.findByIdAndDelete(student.user);
    sendSuccess(res, 'Student deleted successfully');
  } catch (err) { next(err); }
};

module.exports = { getStudents, createStudent, getStudent, updateStudent, getMyChildren, deleteStudent };

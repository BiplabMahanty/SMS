const mongoose = require('mongoose');
const { Timetable } = require('../models/Timetable');
const { Student } = require('../models/Student');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { getTeacherByUserId } = require('../services/teacherService');

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'name teacherId' },
  { path: 'academicYear', select: 'name' },
];

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const sortByDayTime = (entries) =>
  entries.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
  });

const getTimetable = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;
    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

const createTimetableEntry = async (req, res, next) => {
  try {
    const teacherConflict = await Timetable.findOne({
      teacher: req.body.teacher,
      dayOfWeek: req.body.dayOfWeek,
      academicYear: req.body.academicYear,
      $or: [{ startTime: { $lt: req.body.endTime }, endTime: { $gt: req.body.startTime } }],
    });
    if (teacherConflict) throw new AppError('Teacher already has a class at this time slot', 409);
    const entry = await Timetable.create(req.body);
    const populated = await entry.populate(POPULATE);
    sendSuccess(res, 'Timetable entry created successfully', populated, 201);
  } catch (err) { next(err); }
};

const updateTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid timetable entry ID', 400);
    const entry = await Timetable.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE);
    if (!entry) throw new AppError('Timetable entry not found', 404);
    sendSuccess(res, 'Timetable entry updated successfully', entry);
  } catch (err) { next(err); }
};

const deleteTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid timetable entry ID', 400);
    const entry = await Timetable.findByIdAndDelete(id);
    if (!entry) throw new AppError('Timetable entry not found', 404);
    sendSuccess(res, 'Timetable entry deleted successfully');
  } catch (err) { next(err); }
};

const getMyTimetableTeacher = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const filter = { teacher: teacher._id };
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;
    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

const getMyTimetableStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('class section academicYear');
    if (!student) throw new AppError('Student profile not found', 404);
    const filter = { class: student.class, academicYear: student.academicYear };
    if (student.section) filter.section = student.section;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;
    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

const getChildTimetable = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);
    const student = await Student.findById(studentId).select('class section academicYear parent');
    if (!student) throw new AppError('Student not found', 404);
    if (student.parent?.toString() !== req.user.userId) throw new AppError("You are not authorized to view this student's timetable", 403);
    const filter = { class: student.class, academicYear: student.academicYear };
    if (student.section) filter.section = student.section;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;
    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

module.exports = { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry, getMyTimetableTeacher, getMyTimetableStudent, getChildTimetable };

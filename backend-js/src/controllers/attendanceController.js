const mongoose = require('mongoose');
const { Attendance } = require('../models/Attendance');
const { Student } = require('../models/Student');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { getTeacherByUserId } = require('../services/teacherService');

const POPULATE = [
  { path: 'student', select: 'name studentId rollNumber' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'markedBy', select: 'name' },
];

function buildDateRange(month, year, date) {
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return { $gte: d, $lt: next };
  }
  if (month && year) {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    return { $gte: new Date(y, m, 1), $lt: new Date(y, m + 1, 1) };
  }
  return undefined;
}

function calcPercentage(records) {
  if (!records.length) return 0;
  const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  return Math.round((present / records.length) * 100);
}

const markAttendance = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUserId(req.user.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const { records, date, academicYear, class: classId, section, subject } = req.body;
    const dateObj = new Date(date);
    const ops = records.map((r) => ({
      updateOne: {
        filter: {
          student: new mongoose.Types.ObjectId(r.student),
          date: dateObj,
          ...(subject ? { subject } : { subject: { $exists: false } }),
        },
        update: {
          $set: {
            student: new mongoose.Types.ObjectId(r.student),
            date: dateObj,
            academicYear,
            class: classId,
            ...(section && { section }),
            ...(subject && { subject }),
            status: r.status,
            markedBy: new mongoose.Types.ObjectId(req.user.userId),
            ...(r.checkIn && { checkIn: r.checkIn }),
            ...(r.checkOut && { checkOut: r.checkOut }),
            ...(r.remarks && { remarks: r.remarks }),
          },
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    sendSuccess(res, 'Attendance marked successfully', null, 200);
  } catch (err) { next(err); }
};

const getClassAttendance = async (req, res, next) => {
  try {
    const { class: classId, section, date, academicYear, subject } = req.query;
    if (!classId || !date || !academicYear) throw new AppError('class, date and academicYear are required', 400);
    const dateObj = new Date(date);
    const next1 = new Date(dateObj);
    next1.setDate(next1.getDate() + 1);
    const filter = { class: classId, academicYear, date: { $gte: dateObj, $lt: next1 } };
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    else filter.subject = { $exists: false };
    const records = await Attendance.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Class attendance fetched', records);
  } catch (err) { next(err); }
};

const getAttendanceHistory = async (req, res, next) => {
  try {
    const { class: classId, section, academicYear, month, year, date, subject } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const filter = {};
    if (classId) filter.class = classId;
    if (section) filter.section = section;
    if (academicYear) filter.academicYear = academicYear;
    if (subject) filter.subject = subject;
    const dateRange = buildDateRange(month, year, date);
    if (dateRange) filter.date = dateRange;
    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter).populate(POPULATE).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean();
    sendSuccess(res, 'Attendance history fetched', records, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid attendance ID', 400);
    const record = await Attendance.findByIdAndUpdate(
      id,
      { $set: { ...req.body, markedBy: new mongoose.Types.ObjectId(req.user.userId) } },
      { new: true, runValidators: true }
    ).populate(POPULATE);
    if (!record) throw new AppError('Attendance record not found', 404);
    sendSuccess(res, 'Attendance updated', record);
  } catch (err) { next(err); }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('_id academicYear');
    if (!student) throw new AppError('Student profile not found', 404);
    const { month, year, subject } = req.query;
    const filter = { student: student._id, academicYear: student.academicYear };
    if (subject) filter.subject = subject;
    else filter.subject = { $exists: false };
    const dateRange = buildDateRange(month, year);
    if (dateRange) filter.date = dateRange;
    const records = await Attendance.find(filter).populate([{ path: 'subject', select: 'name code' }]).sort({ date: -1 }).lean();
    sendSuccess(res, 'Attendance fetched', { records, percentage: calcPercentage(records) });
  } catch (err) { next(err); }
};

const getMyAttendanceSummary = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.userId }).select('_id academicYear');
    if (!student) throw new AppError('Student profile not found', 404);
    const allRecords = await Attendance.find({ student: student._id, academicYear: student.academicYear })
      .populate([{ path: 'subject', select: 'name code' }]).lean();
    const daily = allRecords.filter((r) => !r.subject);
    const bySubject = {};
    allRecords.filter((r) => r.subject).forEach((r) => {
      const key = r.subject._id.toString();
      if (!bySubject[key]) bySubject[key] = { name: r.subject.name, code: r.subject.code, records: [] };
      bySubject[key].records.push(r);
    });
    const subjectSummary = Object.values(bySubject).map(({ name, code, records }) => ({
      subject: { name, code },
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length,
      percentage: calcPercentage(records),
    }));
    sendSuccess(res, 'Attendance summary fetched', {
      overall: { total: daily.length, present: daily.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length, percentage: calcPercentage(daily) },
      subjectWise: subjectSummary,
    });
  } catch (err) { next(err); }
};

const getChildAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);
    const student = await Student.findById(studentId).select('parent academicYear');
    if (!student) throw new AppError('Student not found', 404);
    if (student.parent?.toString() !== req.user.userId) throw new AppError('Not authorized', 403);
    const { month, year, subject } = req.query;
    const filter = { student: student._id, academicYear: student.academicYear };
    if (subject) filter.subject = subject;
    else filter.subject = { $exists: false };
    const dateRange = buildDateRange(month, year);
    if (dateRange) filter.date = dateRange;
    const records = await Attendance.find(filter).populate([{ path: 'subject', select: 'name code' }]).sort({ date: -1 }).lean();
    sendSuccess(res, 'Child attendance fetched', { records, percentage: calcPercentage(records) });
  } catch (err) { next(err); }
};

const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);
    const student = await Student.findById(studentId).select('name studentId academicYear class section');
    if (!student) throw new AppError('Student not found', 404);
    const { month, year } = req.query;
    const filter = { student: student._id };
    const dateRange = buildDateRange(month, year);
    if (dateRange) filter.date = dateRange;
    const records = await Attendance.find(filter).sort({ date: 1 }).lean();
    sendSuccess(res, 'Student attendance report fetched', { student, records, percentage: calcPercentage(records) });
  } catch (err) { next(err); }
};

const getClassAttendanceReport = async (req, res, next) => {
  try {
    const { class: classId, section, academicYear, month, year } = req.query;
    if (!classId || !academicYear) throw new AppError('class and academicYear are required', 400);
    const filter = { class: classId, academicYear, subject: { $exists: false } };
    if (section) filter.section = section;
    const dateRange = buildDateRange(month, year);
    if (dateRange) filter.date = dateRange;
    const records = await Attendance.find(filter)
      .populate([{ path: 'student', select: 'name studentId rollNumber' }])
      .sort({ date: 1 }).lean();
    const byStudent = {};
    records.forEach((r) => {
      const key = r.student._id.toString();
      if (!byStudent[key]) byStudent[key] = { student: r.student, records: [] };
      byStudent[key].records.push(r);
    });
    const summary = Object.values(byStudent).map(({ student, records: recs }) => ({
      student,
      total: recs.length,
      present: recs.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length,
      absent: recs.filter((r) => r.status === 'ABSENT').length,
      late: recs.filter((r) => r.status === 'LATE').length,
      halfDay: recs.filter((r) => r.status === 'HALF_DAY').length,
      percentage: calcPercentage(recs),
    }));
    sendSuccess(res, 'Class attendance report fetched', summary);
  } catch (err) { next(err); }
};

module.exports = { markAttendance, getClassAttendance, getAttendanceHistory, updateAttendance, getMyAttendance, getMyAttendanceSummary, getChildAttendance, getStudentAttendanceReport, getClassAttendanceReport };

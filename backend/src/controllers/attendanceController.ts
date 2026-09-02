import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance';
import { Student } from '../models/Student';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { getTeacherByUserId } from '../services/teacherService';

const POPULATE = [
  { path: 'student', select: 'name studentId rollNumber' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'markedBy', select: 'name' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDateRange(month?: string, year?: string, date?: string) {
  if (date) {
    const d = new Date(date as string);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return { $gte: d, $lt: next };
  }
  if (month && year) {
    const m = parseInt(month as string, 10) - 1;
    const y = parseInt(year as string, 10);
    return { $gte: new Date(y, m, 1), $lt: new Date(y, m + 1, 1) };
  }
  return undefined;
}

function calcPercentage(records: { status: string }[]) {
  if (!records.length) return 0;
  const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  return Math.round((present / records.length) * 100);
}

// ─── Teacher: mark bulk attendance ───────────────────────────────────────────

// POST /api/attendance/mark
export const markAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const { records, date, academicYear, class: classId, section, subject } = req.body;
    const dateObj = new Date(date as string);

    const ops = (records as { student: string; status: string; checkIn?: string; checkOut?: string; remarks?: string }[]).map((r) => ({
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
            markedBy: new mongoose.Types.ObjectId(req.user!.userId),
            ...(r.checkIn && { checkIn: r.checkIn }),
            ...(r.checkOut && { checkOut: r.checkOut }),
            ...(r.remarks && { remarks: r.remarks }),
          },
        },
        upsert: true,
      },
    })) as Parameters<typeof Attendance.bulkWrite>[0];

    await Attendance.bulkWrite(ops);
    sendSuccess(res, 'Attendance marked successfully', null, 200);
  } catch (err) { next(err); }
};

// ─── Teacher: get class attendance for a date ─────────────────────────────────

// GET /api/attendance/class?class=&section=&date=&academicYear=&subject=
export const getClassAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { class: classId, section, date, academicYear, subject } = req.query;
    if (!classId || !date || !academicYear) throw new AppError('class, date and academicYear are required', 400);

    const dateObj = new Date(date as string);
    const next1 = new Date(dateObj);
    next1.setDate(next1.getDate() + 1);

    const filter: Record<string, unknown> = {
      class: classId as string,
      academicYear: academicYear as string,
      date: { $gte: dateObj, $lt: next1 },
    };
    if (section) filter.section = section as string;
    if (subject) filter.subject = subject as string;
    else filter.subject = { $exists: false };

    const records = await Attendance.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Class attendance fetched', records);
  } catch (err) { next(err); }
};

// ─── Teacher / Admin: attendance history for a class ─────────────────────────

// GET /api/attendance/history?class=&section=&academicYear=&month=&year=&page=&limit=
export const getAttendanceHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { class: classId, section, academicYear, month, year, date, subject } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 30);

    const filter: Record<string, unknown> = {};
    if (classId) filter.class = classId as string;
    if (section) filter.section = section as string;
    if (academicYear) filter.academicYear = academicYear as string;
    if (subject) filter.subject = subject as string;

    const dateRange = buildDateRange(month as string, year as string, date as string);
    if (dateRange) filter.date = dateRange;

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate(POPULATE)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendSuccess(res, 'Attendance history fetched', records, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ─── Update single record ─────────────────────────────────────────────────────

// PUT /api/attendance/:id
export const updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid attendance ID', 400);

    const record = await Attendance.findByIdAndUpdate(
      id,
      { $set: { ...req.body, markedBy: new mongoose.Types.ObjectId(req.user!.userId) } },
      { new: true, runValidators: true }
    ).populate(POPULATE);

    if (!record) throw new AppError('Attendance record not found', 404);
    sendSuccess(res, 'Attendance updated', record);
  } catch (err) { next(err); }
};

// ─── Student: my attendance ───────────────────────────────────────────────────

// GET /api/attendance/me?month=&year=&subject=
export const getMyAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('_id academicYear');
    if (!student) throw new AppError('Student profile not found', 404);

    const { month, year, subject } = req.query;
    const filter: Record<string, unknown> = {
      student: student._id,
      academicYear: student.academicYear,
    };
    if (subject) filter.subject = subject as string;
    else filter.subject = { $exists: false };

    const dateRange = buildDateRange(month as string, year as string);
    if (dateRange) filter.date = dateRange;

    const records = await Attendance.find(filter)
      .populate([{ path: 'subject', select: 'name code' }])
      .sort({ date: -1 })
      .lean();

    const percentage = calcPercentage(records);
    sendSuccess(res, 'Attendance fetched', { records, percentage });
  } catch (err) { next(err); }
};

// GET /api/attendance/me/summary  — overall + subject-wise
export const getMyAttendanceSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('_id academicYear');
    if (!student) throw new AppError('Student profile not found', 404);

    const allRecords = await Attendance.find({
      student: student._id,
      academicYear: student.academicYear,
    }).populate([{ path: 'subject', select: 'name code' }]).lean();

    const daily = allRecords.filter((r) => !r.subject);
    const bySubject: Record<string, { name: string; code: string; records: typeof allRecords }> = {};

    allRecords
      .filter((r) => r.subject)
      .forEach((r) => {
        const sub = r.subject as unknown as { _id: string; name: string; code: string };
        const key = sub._id.toString();
        if (!bySubject[key]) bySubject[key] = { name: sub.name, code: sub.code, records: [] };
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

// ─── Parent: child attendance ─────────────────────────────────────────────────

// GET /api/attendance/child/:studentId?month=&year=&subject=
export const getChildAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);

    const student = await Student.findById(studentId).select('parent academicYear');
    if (!student) throw new AppError('Student not found', 404);
    if (student.parent?.toString() !== req.user!.userId) throw new AppError('Not authorized', 403);

    const { month, year, subject } = req.query;
    const filter: Record<string, unknown> = {
      student: student._id,
      academicYear: student.academicYear,
    };
    if (subject) filter.subject = subject as string;
    else filter.subject = { $exists: false };

    const dateRange = buildDateRange(month as string, year as string);
    if (dateRange) filter.date = dateRange;

    const records = await Attendance.find(filter)
      .populate([{ path: 'subject', select: 'name code' }])
      .sort({ date: -1 })
      .lean();

    sendSuccess(res, 'Child attendance fetched', { records, percentage: calcPercentage(records) });
  } catch (err) { next(err); }
};

// ─── Admin: reports ───────────────────────────────────────────────────────────

// GET /api/attendance/report/student/:studentId?month=&year=
export const getStudentAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);

    const student = await Student.findById(studentId).select('name studentId academicYear class section');
    if (!student) throw new AppError('Student not found', 404);

    const { month, year } = req.query;
    const filter: Record<string, unknown> = { student: student._id };
    const dateRange = buildDateRange(month as string, year as string);
    if (dateRange) filter.date = dateRange;

    const records = await Attendance.find(filter).sort({ date: 1 }).lean();
    const percentage = calcPercentage(records);

    sendSuccess(res, 'Student attendance report fetched', { student, records, percentage });
  } catch (err) { next(err); }
};

// GET /api/attendance/report/class?class=&section=&academicYear=&month=&year=
export const getClassAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { class: classId, section, academicYear, month, year } = req.query;
    if (!classId || !academicYear) throw new AppError('class and academicYear are required', 400);

    const filter: Record<string, unknown> = { class: classId as string, academicYear: academicYear as string, subject: { $exists: false } };
    if (section) filter.section = section as string;

    const dateRange = buildDateRange(month as string, year as string);
    if (dateRange) filter.date = dateRange;

    const records = await Attendance.find(filter)
      .populate([{ path: 'student', select: 'name studentId rollNumber' }])
      .sort({ date: 1, 'student.rollNumber': 1 })
      .lean();

    // Group by student
    const byStudent: Record<string, { student: unknown; records: typeof records }> = {};
    records.forEach((r) => {
      const key = (r.student as unknown as { _id: string })._id.toString();
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

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Timetable } from '../models/Timetable';
import { Student } from '../models/Student';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { getTeacherByUserId } from '../services/teacherService';

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'name teacherId' },
  { path: 'academicYear', select: 'name' },
];

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const sortByDayTime = (entries: any[]) =>
  entries.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
  });

// GET /api/timetable  — admin: filter by class/section/teacher/academicYear
export const getTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;

    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

// POST /api/timetable
export const createTimetableEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for teacher double-booking on same day+time
    const teacherConflict = await Timetable.findOne({
      teacher: req.body.teacher,
      dayOfWeek: req.body.dayOfWeek,
      academicYear: req.body.academicYear,
      $or: [
        { startTime: { $lt: req.body.endTime }, endTime: { $gt: req.body.startTime } },
      ],
    });
    if (teacherConflict) throw new AppError('Teacher already has a class at this time slot', 409);

    const entry = await Timetable.create(req.body);
    const populated = await entry.populate(POPULATE);
    sendSuccess(res, 'Timetable entry created successfully', populated, 201);
  } catch (err) { next(err); }
};

// PUT /api/timetable/:id
export const updateTimetableEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid timetable entry ID', 400);

    const entry = await Timetable.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE);
    if (!entry) throw new AppError('Timetable entry not found', 404);
    sendSuccess(res, 'Timetable entry updated successfully', entry);
  } catch (err) { next(err); }
};

// DELETE /api/timetable/:id
export const deleteTimetableEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid timetable entry ID', 400);

    const entry = await Timetable.findByIdAndDelete(id);
    if (!entry) throw new AppError('Timetable entry not found', 404);
    sendSuccess(res, 'Timetable entry deleted successfully');
  } catch (err) { next(err); }
};

// GET /api/timetable/me/teacher  — teacher sees their own schedule
export const getMyTimetableTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const filter: Record<string, unknown> = { teacher: teacher._id };
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;

    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

// GET /api/timetable/me/student  — student sees their class timetable
export const getMyTimetableStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('class section academicYear');
    if (!student) throw new AppError('Student profile not found', 404);

    const filter: Record<string, unknown> = {
      class: student.class,
      academicYear: student.academicYear,
    };
    if (student.section) filter.section = student.section;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;

    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

// GET /api/timetable/child/:studentId  — parent sees their child's timetable
export const getChildTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;
    if (!mongoose.Types.ObjectId.isValid(studentId)) throw new AppError('Invalid student ID', 400);

    const student = await Student.findById(studentId).select('class section academicYear parent');
    if (!student) throw new AppError('Student not found', 404);

    // Verify the requesting user is the parent of this student
    if (student.parent?.toString() !== req.user!.userId) {
      throw new AppError('You are not authorized to view this student\'s timetable', 403);
    }

    const filter: Record<string, unknown> = {
      class: student.class,
      academicYear: student.academicYear,
    };
    if (student.section) filter.section = student.section;
    if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;

    const entries = await Timetable.find(filter).populate(POPULATE).lean();
    sendSuccess(res, 'Timetable fetched successfully', sortByDayTime(entries));
  } catch (err) { next(err); }
};

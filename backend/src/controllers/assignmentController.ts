import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { Assignment } from '../models/Assignment';
import { AssignmentSubmission } from '../models/AssignmentSubmission';
import { Student } from '../models/Student';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { getTeacherByUserId } from '../services/teacherService';
import { fileToAttachment } from '../middleware/upload';

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'name teacherId' },
  { path: 'academicYear', select: 'name' },
];

// ─── Teacher ──────────────────────────────────────────────────────────────────

// POST /api/assignments
export const createAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const files = (req.files as Express.Multer.File[]) ?? [];
    const attachments = files.map(fileToAttachment);

    const assignment = await Assignment.create({ ...req.body, teacher: teacher._id, attachments });
    const populated = await assignment.populate(POPULATE);
    sendSuccess(res, 'Assignment created', populated, 201);
  } catch (err) { next(err); }
};

// PUT /api/assignments/:id
export const updateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!assignment) throw new AppError('Assignment not found or not yours', 404);

    const newFiles = (req.files as Express.Multer.File[]) ?? [];
    const newAttachments = newFiles.map(fileToAttachment);

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, ...(newAttachments.length && { attachments: [...assignment.attachments, ...newAttachments] }) } },
      { new: true, runValidators: true }
    ).populate(POPULATE);

    sendSuccess(res, 'Assignment updated', updated);
  } catch (err) { next(err); }
};

// DELETE /api/assignments/:id
export const deleteAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await getTeacherByUserId(req.user!.userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: teacher._id });
    if (!assignment) throw new AppError('Assignment not found or not yours', 404);

    // Clean up files
    assignment.attachments.forEach((a) => { try { fs.unlinkSync(a.path); } catch {} });
    sendSuccess(res, 'Assignment deleted');
  } catch (err) { next(err); }
};

// GET /api/assignments  — teacher: own; admin: all; filter by class/section/academicYear
export const getAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const filter: Record<string, unknown> = {};

    if (req.user!.role === 'TEACHER') {
      const teacher = await getTeacherByUserId(req.user!.userId);
      if (!teacher) throw new AppError('Teacher profile not found', 404);
      filter.teacher = teacher._id;
    }
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.subject) filter.subject = req.query.subject;

    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
      .populate(POPULATE)
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendSuccess(res, 'Assignments fetched', assignments, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/assignments/:id
export const getAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(POPULATE).lean();
    if (!assignment) throw new AppError('Assignment not found', 404);
    sendSuccess(res, 'Assignment fetched', assignment);
  } catch (err) { next(err); }
};

// GET /api/assignments/:id/submissions  — teacher views all submissions
export const getSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate([{ path: 'student', select: 'name studentId rollNumber' }])
      .sort({ submittedAt: -1 })
      .lean();
    sendSuccess(res, 'Submissions fetched', submissions);
  } catch (err) { next(err); }
};

// PUT /api/assignments/submissions/:submissionId/grade  — teacher grades
export const gradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { marks, feedback } = req.body;
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { $set: { marks, feedback, status: 'GRADED', gradedAt: new Date(), gradedBy: new mongoose.Types.ObjectId(req.user!.userId) } },
      { new: true }
    ).populate([{ path: 'student', select: 'name studentId' }]);
    if (!submission) throw new AppError('Submission not found', 404);
    sendSuccess(res, 'Submission graded', submission);
  } catch (err) { next(err); }
};

// ─── Student ──────────────────────────────────────────────────────────────────

// GET /api/assignments/me  — student sees assignments for their class
export const getMyAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('class section academicYear');
    if (!student) throw new AppError('Student profile not found', 404);

    const filter: Record<string, unknown> = { class: student.class, academicYear: student.academicYear };
    if (student.section) filter.$or = [{ section: student.section }, { section: { $exists: false } }];

    const assignments = await Assignment.find(filter).populate(POPULATE).sort({ dueDate: 1 }).lean();

    // Attach submission status for each
    const studentDoc = await Student.findOne({ user: req.user!.userId }).select('_id');
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignments.map((a) => a._id) },
      student: studentDoc!._id,
    }).lean();

    const subMap = new Map(submissions.map((s) => [s.assignment.toString(), s]));
    const result = assignments.map((a) => ({ ...a, submission: subMap.get(a._id.toString()) ?? null }));

    sendSuccess(res, 'Assignments fetched', result);
  } catch (err) { next(err); }
};

// POST /api/assignments/:id/submit
export const submitAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('_id');
    if (!student) throw new AppError('Student profile not found', 404);

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);

    const existing = await AssignmentSubmission.findOne({ assignment: req.params.id, student: student._id });
    if (existing) throw new AppError('Already submitted', 409);

    const files = (req.files as Express.Multer.File[]) ?? [];
    const attachments = files.map(fileToAttachment);
    const isLate = new Date() > assignment.dueDate;

    const submission = await AssignmentSubmission.create({
      assignment: req.params.id,
      student: student._id,
      attachments,
      note: req.body.note,
      status: isLate ? 'LATE' : 'SUBMITTED',
      submittedAt: new Date(),
    });

    sendSuccess(res, 'Assignment submitted', submission, 201);
  } catch (err) { next(err); }
};

// GET /api/assignments/:id/my-submission
export const getMySubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user!.userId }).select('_id');
    if (!student) throw new AppError('Student profile not found', 404);

    const submission = await AssignmentSubmission.findOne({ assignment: req.params.id, student: student._id }).lean();
    sendSuccess(res, 'Submission fetched', submission);
  } catch (err) { next(err); }
};

// ─── File download ────────────────────────────────────────────────────────────

// GET /api/assignments/files/:filename
export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) throw new AppError('File not found', 404);
    res.download(filePath);
  } catch (err) { next(err); }
};

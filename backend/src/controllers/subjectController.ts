import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Subject } from '../models/Subject';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'academicYear', select: 'name' },
  { path: 'teacher', select: 'name teacherId' },
];

// GET /api/subjects
export const getSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.search) {
      const s = (req.query.search as string).trim();
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      Subject.find(filter).populate(POPULATE).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Subject.countDocuments(filter),
    ]);

    sendSuccess(res, 'Subjects fetched successfully', subjects, 200, {
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// POST /api/subjects
export const createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Subject.findOne({
      code: req.body.code.trim().toUpperCase(),
      class: req.body.class,
      academicYear: req.body.academicYear,
    });
    if (existing) throw new AppError('A subject with this code already exists for this class and year', 409);

    const subject = await Subject.create(req.body);
    const populated = await subject.populate(POPULATE);
    sendSuccess(res, 'Subject created successfully', populated, 201);
  } catch (err) { next(err); }
};

// GET /api/subjects/:id
export const getSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid subject ID', 400);

    const subject = await Subject.findById(id).populate(POPULATE);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject fetched successfully', subject);
  } catch (err) { next(err); }
};

// PUT /api/subjects/:id
export const updateSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid subject ID', 400);

    if (req.body.code) {
      const conflict = await Subject.findOne({
        code: req.body.code.trim().toUpperCase(),
        class: req.body.class,
        academicYear: req.body.academicYear,
        _id: { $ne: id },
      });
      if (conflict) throw new AppError('Subject code already in use for this class and year', 409);
    }

    const subject = await Subject.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true }).populate(POPULATE);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject updated successfully', subject);
  } catch (err) { next(err); }
};

// DELETE /api/subjects/:id
export const deleteSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid subject ID', 400);

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) throw new AppError('Subject not found', 404);
    sendSuccess(res, 'Subject deleted successfully');
  } catch (err) { next(err); }
};

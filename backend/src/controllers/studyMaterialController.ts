import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { StudyMaterial } from '../models/StudyMaterial';
import { Student } from '../models/Student';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { getTeacherByUserId } from '../services/teacherService';
import { fileToAttachment, getMaterialType } from '../middleware/upload';

const POPULATE = [
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'subject', select: 'name code' },
  { path: 'uploadedBy', select: 'name' },
  { path: 'academicYear', select: 'name' },
];

// POST /api/study-materials
export const createMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file;
    if (!file) throw new AppError('File is required', 400);

    const material = await StudyMaterial.create({
      ...req.body,
      uploadedBy: req.user!.userId,
      type: getMaterialType(file.mimetype),
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    });
    const populated = await material.populate(POPULATE);
    sendSuccess(res, 'Study material uploaded', populated, 201);
  } catch (err) { next(err); }
};

// DELETE /api/study-materials/:id
export const deleteMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user!.role === 'TEACHER') {
      filter.uploadedBy = req.user!.userId;
    }
    const material = await StudyMaterial.findOneAndDelete(filter);
    if (!material) throw new AppError('Material not found or not yours', 404);
    try { fs.unlinkSync(material.path); } catch {}
    sendSuccess(res, 'Study material deleted');
  } catch (err) { next(err); }
};

// GET /api/study-materials?class=&section=&subject=&academicYear=&page=&limit=
export const getMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const filter: Record<string, unknown> = {};

    if (req.user!.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user!.userId }).select('class section academicYear');
      if (!student) throw new AppError('Student profile not found', 404);
      filter.class = student.class;
      filter.academicYear = student.academicYear;
    } else {
      if (req.query.class) filter.class = req.query.class;
      if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    }

    if (req.query.section) filter.section = req.query.section as string;
    if (req.query.subject) filter.subject = req.query.subject as string;
    if (req.query.type) filter.type = req.query.type;

    const total = await StudyMaterial.countDocuments(filter);
    const materials = await StudyMaterial.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendSuccess(res, 'Study materials fetched', materials, 200, { total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/study-materials/files/:filename
export const downloadMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) throw new AppError('File not found', 404);
    res.download(filePath);
  } catch (err) { next(err); }
};

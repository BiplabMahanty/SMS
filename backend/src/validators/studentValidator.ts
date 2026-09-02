import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendError } from '../utils/response';

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const validateCreateStudent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password, academicYear, class: classId } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!academicYear || !isValidObjectId(academicYear)) {
    errors.push('Valid academic year ID is required');
  }
  if (!classId || !isValidObjectId(classId)) {
    errors.push('Valid class ID is required');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

export const validateUpdateStudent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, academicYear, class: classId, section, parent } = req.body;
  const errors: string[] = [];

  if (email !== undefined && !isValidEmail(email)) {
    errors.push('Valid email is required');
  }
  if (academicYear !== undefined && !isValidObjectId(academicYear)) {
    errors.push('Valid academic year ID is required');
  }
  if (classId !== undefined && !isValidObjectId(classId)) {
    errors.push('Valid class ID is required');
  }
  if (section !== undefined && section !== null && !isValidObjectId(section)) {
    errors.push('Valid section ID is required');
  }
  if (parent !== undefined && parent !== null && !isValidObjectId(parent)) {
    errors.push('Valid parent ID is required');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

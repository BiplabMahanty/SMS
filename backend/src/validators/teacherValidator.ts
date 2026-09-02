import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendError } from '../utils/response';

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const validateCreateTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;
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

  // Validate assignedClasses if provided
  if (req.body.assignedClasses && Array.isArray(req.body.assignedClasses)) {
    req.body.assignedClasses.forEach((ac: Record<string, string>, i: number) => {
      if (!ac.class || !isValidObjectId(ac.class)) {
        errors.push(`assignedClasses[${i}].class must be a valid ObjectId`);
      }
      if (!ac.academicYear || !isValidObjectId(ac.academicYear)) {
        errors.push(`assignedClasses[${i}].academicYear must be a valid ObjectId`);
      }
      if (ac.section && !isValidObjectId(ac.section)) {
        errors.push(`assignedClasses[${i}].section must be a valid ObjectId`);
      }
    });
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

export const validateUpdateTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, assignedClasses } = req.body;
  const errors: string[] = [];

  if (email !== undefined && !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (assignedClasses && Array.isArray(assignedClasses)) {
    assignedClasses.forEach((ac: Record<string, string>, i: number) => {
      if (!ac.class || !isValidObjectId(ac.class)) {
        errors.push(`assignedClasses[${i}].class must be a valid ObjectId`);
      }
      if (!ac.academicYear || !isValidObjectId(ac.academicYear)) {
        errors.push(`assignedClasses[${i}].academicYear must be a valid ObjectId`);
      }
    });
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

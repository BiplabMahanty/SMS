import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
    errors.push('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
    errors.push('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPassword, newPassword } = req.body;
  const errors: string[] = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Current password is required');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    errors.push('New password must be at least 8 characters');
  }
  if (currentPassword === newPassword) {
    errors.push('New password must differ from current password');
  }

  if (errors.length > 0) {
    sendError(res, 'Validation failed', 400, errors);
    return;
  }
  next();
};

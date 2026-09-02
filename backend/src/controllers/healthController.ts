import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/response';

export const healthCheck = (_req: Request, res: Response): void => {
  sendSuccess(res, 'Student Management API is running', {
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

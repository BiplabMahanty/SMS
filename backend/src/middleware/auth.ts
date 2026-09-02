import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/authService';
import { User, UserRole } from '../models/User';
import { sendError } from '../utils/response';

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active — role comes from DB, not token
    const user = await User.findById(payload.userId).select('role status');
    if (!user || user.status !== 'ACTIVE') {
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    req.user = { userId: payload.userId, role: user.role };
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 'You do not have permission to perform this action', 403);
      return;
    }
    next();
  };
};

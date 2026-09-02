const { verifyAccessToken } = require('../services/authService');
const { User } = require('../models/User');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
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

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    sendError(res, 'You do not have permission to perform this action', 403);
    return;
  }
  next();
};

module.exports = { authenticate, authorize };

const { sendError } = require('../utils/response');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    sendError(res, messages[0], 400, messages);
    return;
  }
  if (err.code === 11000) {
    sendError(res, 'Duplicate field value', 400);
    return;
  }
  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
};

const notFound = (_req, res) => {
  sendError(res, 'Route not found', 404);
};

module.exports = { AppError, errorHandler, notFound };

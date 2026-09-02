const { sendError } = require('../utils/response');

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) errors.push('Valid email is required');
  if (!password || typeof password !== 'string' || password.length < 1) errors.push('Password is required');
  if (errors.length) { sendError(res, 'Validation failed', 400, errors); return; }
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) errors.push('Valid email is required');
  if (!password || typeof password !== 'string' || password.length < 8) errors.push('Password must be at least 8 characters');
  if (errors.length) { sendError(res, 'Validation failed', 400, errors); return; }
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];
  if (!currentPassword || typeof currentPassword !== 'string') errors.push('Current password is required');
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) errors.push('New password must be at least 8 characters');
  if (currentPassword === newPassword) errors.push('New password must differ from current password');
  if (errors.length) { sendError(res, 'Validation failed', 400, errors); return; }
  next();
};

module.exports = { validateLogin, validateRegister, validateChangePassword };

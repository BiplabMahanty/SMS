const mongoose = require('mongoose');
const { sendError } = require('../utils/response');

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCreateTeacher = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !isValidEmail(email)) errors.push('Valid email is required');
  if (!password || typeof password !== 'string' || password.length < 8) errors.push('Password must be at least 8 characters');
  if (req.body.assignedClasses && Array.isArray(req.body.assignedClasses)) {
    req.body.assignedClasses.forEach((ac, i) => {
      if (!ac.class || !isValidObjectId(ac.class)) errors.push(`assignedClasses[${i}].class must be a valid ObjectId`);
      if (!ac.academicYear || !isValidObjectId(ac.academicYear)) errors.push(`assignedClasses[${i}].academicYear must be a valid ObjectId`);
      if (ac.section && !isValidObjectId(ac.section)) errors.push(`assignedClasses[${i}].section must be a valid ObjectId`);
    });
  }
  if (errors.length) { sendError(res, 'Validation failed', 400, errors); return; }
  next();
};

const validateUpdateTeacher = (req, res, next) => {
  const { email, assignedClasses } = req.body;
  const errors = [];
  if (email !== undefined && !isValidEmail(email)) errors.push('Valid email is required');
  if (assignedClasses && Array.isArray(assignedClasses)) {
    assignedClasses.forEach((ac, i) => {
      if (!ac.class || !isValidObjectId(ac.class)) errors.push(`assignedClasses[${i}].class must be a valid ObjectId`);
      if (!ac.academicYear || !isValidObjectId(ac.academicYear)) errors.push(`assignedClasses[${i}].academicYear must be a valid ObjectId`);
    });
  }
  if (errors.length) { sendError(res, 'Validation failed', 400, errors); return; }
  next();
};

module.exports = { validateCreateTeacher, validateUpdateTeacher };

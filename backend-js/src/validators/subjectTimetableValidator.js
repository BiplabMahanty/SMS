const { sendError } = require('../utils/response');

const validateCreateSubject = (req, res, next) => {
  const { name, code, class: classId, academicYear } = req.body;
  const errors = [];
  if (!name?.trim()) errors.push('Subject name is required');
  if (!code?.trim()) errors.push('Subject code is required');
  if (!classId) errors.push('Class is required');
  if (!academicYear) errors.push('Academic year is required');
  if (errors.length) { sendError(res, 'Validation failed', 422, errors); return; }
  next();
};

const validateUpdateSubject = (req, res, next) => {
  const { name, code } = req.body;
  const errors = [];
  if (name !== undefined && !name.trim()) errors.push('Subject name cannot be empty');
  if (code !== undefined && !code.trim()) errors.push('Subject code cannot be empty');
  if (errors.length) { sendError(res, 'Validation failed', 422, errors); return; }
  next();
};

const TIME_RE = /^\d{2}:\d{2}$/;
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const validateCreateTimetable = (req, res, next) => {
  const { academicYear, class: classId, subject, teacher, dayOfWeek, startTime, endTime } = req.body;
  const errors = [];
  if (!academicYear) errors.push('Academic year is required');
  if (!classId) errors.push('Class is required');
  if (!subject) errors.push('Subject is required');
  if (!teacher) errors.push('Teacher is required');
  if (!dayOfWeek || !DAYS.includes(dayOfWeek)) errors.push('Valid day of week is required');
  if (!startTime || !TIME_RE.test(startTime)) errors.push('Start time must be in HH:MM format');
  if (!endTime || !TIME_RE.test(endTime)) errors.push('End time must be in HH:MM format');
  if (startTime && endTime && startTime >= endTime) errors.push('End time must be after start time');
  if (errors.length) { sendError(res, 'Validation failed', 422, errors); return; }
  next();
};

const validateUpdateTimetable = (req, res, next) => {
  const { startTime, endTime, dayOfWeek } = req.body;
  const errors = [];
  if (dayOfWeek !== undefined && !DAYS.includes(dayOfWeek)) errors.push('Invalid day of week');
  if (startTime !== undefined && !TIME_RE.test(startTime)) errors.push('Start time must be in HH:MM format');
  if (endTime !== undefined && !TIME_RE.test(endTime)) errors.push('End time must be in HH:MM format');
  if (errors.length) { sendError(res, 'Validation failed', 422, errors); return; }
  next();
};

module.exports = { validateCreateSubject, validateUpdateSubject, validateCreateTimetable, validateUpdateTimetable };

const { sendError } = require('../utils/response');

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];

const validateMarkAttendance = (req, res, next) => {
  const { records, date, academicYear, class: classId } = req.body;
  const errors = [];
  if (!date) errors.push('Date is required');
  if (!academicYear) errors.push('Academic year is required');
  if (!classId) errors.push('Class is required');
  if (!Array.isArray(records) || records.length === 0) errors.push('Attendance records array is required');
  if (Array.isArray(records)) {
    records.forEach((r, i) => {
      if (!r.student) errors.push(`Record ${i + 1}: student is required`);
      if (!r.status || !STATUSES.includes(r.status)) errors.push(`Record ${i + 1}: valid status is required`);
    });
  }
  if (errors.length) { sendError(res, 'Validation failed', 422, errors); return; }
  next();
};

const validateUpdateAttendance = (req, res, next) => {
  const { status } = req.body;
  if (status !== undefined && !STATUSES.includes(status)) {
    sendError(res, 'Validation failed', 422, ['Invalid status value']);
    return;
  }
  next();
};

module.exports = { validateMarkAttendance, validateUpdateAttendance };

const { Student } = require('../models/Student');

const generateStudentId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Student.countDocuments();
  return `STU${year}${String(count + 1).padStart(4, '0')}`;
};

module.exports = { generateStudentId };

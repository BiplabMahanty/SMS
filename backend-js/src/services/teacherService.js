const { Teacher } = require('../models/Teacher');

const generateTeacherId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Teacher.countDocuments();
  return `TCH${year}${String(count + 1).padStart(4, '0')}`;
};

const getTeacherByUserId = (userId) => Teacher.findOne({ user: userId });

module.exports = { generateTeacherId, getTeacherByUserId };

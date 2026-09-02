const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true, partialFilterExpression: { subject: { $exists: true } } });
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ academicYear: 1 });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = { Attendance };

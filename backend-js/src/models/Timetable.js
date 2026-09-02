const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: [true, 'Class is required'] },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: [true, 'Subject is required'] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: [true, 'Teacher is required'] },
    dayOfWeek: { type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], required: [true, 'Day of week is required'] },
    startTime: { type: String, required: [true, 'Start time is required'], match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'] },
    endTime: { type: String, required: [true, 'End time is required'], match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'] },
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1, academicYear: 1, dayOfWeek: 1 });
timetableSchema.index({ teacher: 1, academicYear: 1, dayOfWeek: 1 });
timetableSchema.index({ class: 1, section: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
module.exports = { Timetable };

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Subject name is required'], trim: true },
    code: { type: String, required: [true, 'Subject code is required'], trim: true, uppercase: true },
    description: { type: String, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: [true, 'Class is required'] },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    isElective: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subjectSchema.index({ class: 1, academicYear: 1 });
subjectSchema.index({ teacher: 1 });
subjectSchema.index({ code: 1, class: 1, academicYear: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = { Subject };

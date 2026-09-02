const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Section name is required'], trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: [true, 'Class is required'] },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
  },
  { timestamps: true }
);

sectionSchema.index({ class: 1 });
sectionSchema.index({ academicYear: 1 });
sectionSchema.index({ name: 1, class: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);
module.exports = { Section };

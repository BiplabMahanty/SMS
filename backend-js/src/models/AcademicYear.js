const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Academic year name is required'], trim: true, unique: true },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);
academicYearSchema.index({ isCurrent: 1 });
const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

module.exports = { AcademicYear };

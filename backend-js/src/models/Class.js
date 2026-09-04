const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Class name is required'], trim: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
    icon: { type: String, default: '📚' },
  },
  { timestamps: true }
);

classSchema.index({ academicYear: 1 });
classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);
module.exports = { Class };

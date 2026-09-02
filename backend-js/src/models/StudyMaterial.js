const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  type: { type: String, enum: ['PDF', 'DOCUMENT', 'IMAGE', 'VIDEO', 'OTHER'], required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
}, { timestamps: true });

studyMaterialSchema.index({ class: 1, academicYear: 1 });
studyMaterialSchema.index({ subject: 1 });
studyMaterialSchema.index({ uploadedBy: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
module.exports = { StudyMaterial };

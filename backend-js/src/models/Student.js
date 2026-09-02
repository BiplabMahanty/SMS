const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: [true, 'Student ID is required'], unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    admissionDate: { type: Date, required: [true, 'Admission date is required'], default: Date.now },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    rollNumber: { type: String, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

studentSchema.index({ studentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ section: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text', email: 'text', studentId: 'text' });

const Student = mongoose.model('Student', studentSchema);
module.exports = { Student };

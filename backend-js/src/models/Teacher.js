const mongoose = require('mongoose');

const assignedClassSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: [true, 'Teacher ID is required'], unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    department: { type: String, trim: true },
    subjects: [{ type: String, trim: true }],
    assignedClasses: [assignedClassSchema],
    joiningDate: { type: Date, required: [true, 'Joining date is required'], default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ 'assignedClasses.class': 1 });
teacherSchema.index({ name: 'text', email: 'text', teacherId: 'text' });

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = { Teacher };

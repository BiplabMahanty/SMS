import mongoose, { Document, Schema } from 'mongoose';

export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface IAssignedClass {
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
}

export interface ITeacher extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: string;
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  department?: string;
  subjects: string[];
  assignedClasses: IAssignedClass[];
  joiningDate: Date;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
}

const assignedClassSchema = new Schema<IAssignedClass>(
  {
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  },
  { _id: false }
);

const teacherSchema = new Schema<ITeacher>(
  {
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true,
      trim: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    department: { type: String, trim: true },
    subjects: [{ type: String, trim: true }],
    assignedClasses: [assignedClassSchema],
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ 'assignedClasses.class': 1 });
teacherSchema.index({ name: 'text', email: 'text', teacherId: 'text' });

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);

import mongoose, { Document, Schema } from 'mongoose';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  admissionDate: Date;
  academicYear: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  rollNumber?: string;
  parent?: mongoose.Types.ObjectId;
  address?: IAddress;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
      default: Date.now,
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
    rollNumber: { type: String, trim: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'],
      default: 'ACTIVE',
    },
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

export const Student = mongoose.model<IStudent>('Student', studentSchema);

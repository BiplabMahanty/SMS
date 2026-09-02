import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  class: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  teacher?: mongoose.Types.ObjectId;
  isElective: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: [true, 'Subject name is required'], trim: true },
    code: { type: String, required: [true, 'Subject code is required'], trim: true, uppercase: true },
    description: { type: String, trim: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: [true, 'Class is required'] },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    isElective: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subjectSchema.index({ class: 1, academicYear: 1 });
subjectSchema.index({ teacher: 1 });
subjectSchema.index({ code: 1, class: 1, academicYear: 1 }, { unique: true });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

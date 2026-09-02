import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  totalMarks?: number;
  attachments: { filename: string; originalName: string; mimetype: string; size: number; path: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
}, { _id: false });

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000 },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  section: { type: Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, min: 0 },
  attachments: [attachmentSchema],
}, { timestamps: true });

assignmentSchema.index({ class: 1, academicYear: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

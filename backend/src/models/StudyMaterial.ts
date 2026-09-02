import mongoose, { Document, Schema } from 'mongoose';

export type MaterialType = 'PDF' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'OTHER';

export interface IStudyMaterial extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: MaterialType;
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

const studyMaterialSchema = new Schema<IStudyMaterial>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  type: { type: String, enum: ['PDF', 'DOCUMENT', 'IMAGE', 'VIDEO', 'OTHER'], required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  section: { type: Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
}, { timestamps: true });

studyMaterialSchema.index({ class: 1, academicYear: 1 });
studyMaterialSchema.index({ subject: 1 });
studyMaterialSchema.index({ uploadedBy: 1 });

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);

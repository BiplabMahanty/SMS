import mongoose, { Document, Schema } from 'mongoose';

export interface ISection extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  class: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
  },
  { timestamps: true }
);

sectionSchema.index({ class: 1 });
sectionSchema.index({ academicYear: 1 });
sectionSchema.index({ name: 1, class: 1 }, { unique: true });

export const Section = mongoose.model<ISection>('Section', sectionSchema);

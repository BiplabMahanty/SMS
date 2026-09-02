import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  academicYear: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
  },
  { timestamps: true }
);

classSchema.index({ academicYear: 1 });
classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model<IClass>('Class', classSchema);

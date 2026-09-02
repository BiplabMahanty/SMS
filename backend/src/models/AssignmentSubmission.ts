import mongoose, { Document, Schema } from 'mongoose';

export type SubmissionStatus = 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';

export interface IAssignmentSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: SubmissionStatus;
  attachments: { filename: string; originalName: string; mimetype: string; size: number; path: string }[];
  note?: string;
  marks?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
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

const submissionSchema = new Schema<IAssignmentSubmission>({
  assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'], default: 'SUBMITTED' },
  attachments: [attachmentSchema],
  note: { type: String, trim: true, maxlength: 1000 },
  marks: { type: Number, min: 0 },
  feedback: { type: String, trim: true, maxlength: 2000 },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: { type: Date },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1 });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>('AssignmentSubmission', submissionSchema);

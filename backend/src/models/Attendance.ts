import mongoose, { Document, Schema } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  date: Date;
  academicYear: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  markedBy: mongoose.Types.ObjectId;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One record per student per date per subject (null subject = daily)
attendanceSchema.index(
  { student: 1, date: 1, subject: 1 },
  { unique: true, partialFilterExpression: { subject: { $exists: true } } }
);
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ academicYear: 1 });
attendanceSchema.index({ date: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

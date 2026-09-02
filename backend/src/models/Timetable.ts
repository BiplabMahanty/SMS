import mongoose, { Document, Schema } from 'mongoose';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ITimetable extends Document {
  _id: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM" 24h format
  endTime: string;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<ITimetable>(
  {
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: [true, 'Academic year is required'] },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: [true, 'Class is required'] },
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: [true, 'Subject is required'] },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: [true, 'Teacher is required'] },
    dayOfWeek: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      required: [true, 'Day of week is required'],
    },
    startTime: { type: String, required: [true, 'Start time is required'], match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'] },
    endTime: { type: String, required: [true, 'End time is required'], match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'] },
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1, academicYear: 1, dayOfWeek: 1 });
timetableSchema.index({ teacher: 1, academicYear: 1, dayOfWeek: 1 });
// Prevent double-booking: same class+section+day+time slot
timetableSchema.index({ class: 1, section: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);

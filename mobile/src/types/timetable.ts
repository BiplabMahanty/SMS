import { AcademicYear, ClassItem, SectionItem } from './student';

// ─── Subject ────────────────────────────────────────────────────────────────

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  class: ClassItem;
  academicYear: AcademicYear;
  teacher?: { _id: string; name: string; teacherId: string };
  isElective: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectFormData {
  name: string;
  code: string;
  description?: string;
  class: string;
  academicYear: string;
  teacher?: string;
  isElective?: boolean;
}

export interface SubjectsListParams {
  page?: number;
  limit?: number;
  search?: string;
  class?: string;
  academicYear?: string;
  teacher?: string;
}

// ─── Timetable ───────────────────────────────────────────────────────────────

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

export interface TimetableEntry {
  _id: string;
  academicYear: AcademicYear;
  class: ClassItem;
  section?: SectionItem;
  subject: { _id: string; name: string; code: string };
  teacher: { _id: string; name: string; teacherId: string };
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableFormData {
  academicYear: string;
  class: string;
  section?: string;
  subject: string;
  teacher: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TimetableParams {
  class?: string;
  section?: string;
  teacher?: string;
  academicYear?: string;
  dayOfWeek?: DayOfWeek;
}

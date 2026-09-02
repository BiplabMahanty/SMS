import { AcademicYear, ClassItem, SectionItem } from './student';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'];

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
};

export interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; studentId: string; rollNumber?: string };
  date: string;
  academicYear: AcademicYear;
  class: ClassItem;
  section?: SectionItem;
  subject?: { _id: string; name: string; code: string };
  status: AttendanceStatus;
  markedBy: { _id: string; name: string };
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  createdAt: string;
}

export interface AttendanceMarkRecord {
  student: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}

export interface MarkAttendancePayload {
  records: AttendanceMarkRecord[];
  date: string;
  academicYear: string;
  class: string;
  section?: string;
  subject?: string;
}

export interface AttendanceParams {
  class?: string;
  section?: string;
  academicYear?: string;
  date?: string;
  month?: number;
  year?: number;
  subject?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceSummary {
  overall: { total: number; present: number; percentage: number };
  subjectWise: {
    subject: { name: string; code: string };
    total: number;
    present: number;
    percentage: number;
  }[];
}

export interface ClassAttendanceSummaryItem {
  student: { _id: string; name: string; studentId: string; rollNumber?: string };
  total: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  percentage: number;
}

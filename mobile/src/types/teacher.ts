import { AcademicYear, ClassItem, SectionItem, PaginationMeta } from './student';

export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface AssignedClass {
  class: ClassItem;
  section?: SectionItem;
  academicYear: AcademicYear;
}

export interface Teacher {
  _id: string;
  teacherId: string;
  user?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  department?: string;
  subjects: string[];
  assignedClasses: AssignedClass[];
  joiningDate: string;
  status: TeacherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  assignedClasses?: {
    class: string;
    section?: string;
    academicYear: string;
  }[];
  joiningDate?: string;
  status?: TeacherStatus;
}

export interface TeachersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TeacherStatus;
  department?: string;
}

export { PaginationMeta };

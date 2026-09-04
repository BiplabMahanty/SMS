export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface AcademicYear {
  _id: string;
  name: string;
}

export interface ClassItem {
  _id: string;
  name: string;
  icon?: string;
}

export interface SectionItem {
  _id: string;
  name: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: Gender;
  admissionDate: string;
  academicYear: AcademicYear;
  class: ClassItem;
  section?: SectionItem;
  rollNumber?: string;
  parent?: { _id: string; name: string; email: string; phone?: string };
  address?: Address;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: Gender;
  admissionDate?: string;
  academicYear: string;
  class: string;
  section?: string;
  rollNumber?: string;
  address?: Address;
  status?: StudentStatus;
}

export interface StudentsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  academicYear?: string;
  class?: string;
  section?: string;
  gender?: Gender;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

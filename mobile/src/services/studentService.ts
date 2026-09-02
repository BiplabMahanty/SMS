import apiClient from '../api/client';
import { Student, StudentFormData, StudentsListParams } from '../types/student';
import { ApiResponse } from '../types/auth';

interface StudentsResponse {
  data: Student[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const studentService = {
  getStudents: (params?: StudentsListParams) =>
    apiClient.get<ApiResponse<Student[]> & { pagination: StudentsListParams }>('/students', { params }),

  getMyChildren: () =>
    apiClient.get<ApiResponse<Student[]>>('/students/my-children'),

  getStudent: (id: string) =>
    apiClient.get<ApiResponse<Student>>(`/students/${id}`),

  createStudent: (data: StudentFormData) =>
    apiClient.post<ApiResponse<Student>>('/students', data),

  updateStudent: (id: string, data: Partial<StudentFormData>) =>
    apiClient.put<ApiResponse<Student>>(`/students/${id}`, data),

  deleteStudent: (id: string) =>
    apiClient.delete<ApiResponse>(`/students/${id}`),
};

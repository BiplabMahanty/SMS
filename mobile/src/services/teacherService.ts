import apiClient from '../api/client';
import { Teacher, TeacherFormData, TeachersListParams } from '../types/teacher';
import { ApiResponse } from '../types/auth';
import { Student, StudentsListParams } from '../types/student';

export const teacherService = {
  getTeachers: (params?: TeachersListParams) =>
    apiClient.get<ApiResponse<Teacher[]>>('/teachers', { params }),

  getTeacher: (id: string) =>
    apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`),

  createTeacher: (data: TeacherFormData) =>
    apiClient.post<ApiResponse<Teacher>>('/teachers', data),

  updateTeacher: (id: string, data: Partial<TeacherFormData>) =>
    apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),

  deleteTeacher: (id: string) =>
    apiClient.delete<ApiResponse>(`/teachers/${id}`),

  // Teacher self-service
  getMyProfile: () =>
    apiClient.get<ApiResponse<Teacher>>('/teachers/me/profile'),

  getMyClasses: () =>
    apiClient.get<ApiResponse<Teacher['assignedClasses']>>('/teachers/me/classes'),

  getMyStudents: (params?: StudentsListParams) =>
    apiClient.get<ApiResponse<Student[]>>('/teachers/me/students', { params }),
};

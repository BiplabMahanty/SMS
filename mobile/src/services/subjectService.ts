import apiClient from '../api/client';
import { Subject, SubjectFormData, SubjectsListParams } from '../types/timetable';
import { ApiResponse } from '../types/auth';

export const subjectService = {
  getSubjects: (params?: SubjectsListParams) =>
    apiClient.get<ApiResponse<Subject[]>>('/subjects', { params }),

  getSubject: (id: string) =>
    apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`),

  createSubject: (data: SubjectFormData) =>
    apiClient.post<ApiResponse<Subject>>('/subjects', data),

  updateSubject: (id: string, data: Partial<SubjectFormData>) =>
    apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, data),

  deleteSubject: (id: string) =>
    apiClient.delete<ApiResponse>(`/subjects/${id}`),
};

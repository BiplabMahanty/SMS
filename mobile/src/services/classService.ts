import apiClient from '../api/client';
import { ApiResponse } from '../types/auth';
import { ClassItem, SectionItem, AcademicYear } from '../types/student';

export interface ClassWithYear extends ClassItem {
  academicYear: AcademicYear;
}

export const classService = {
  getClasses: (params?: { academicYear?: string }) =>
    apiClient.get<ApiResponse<ClassWithYear[]>>('/classes', { params }),

  createClass: (data: { name: string; academicYear: string; icon?: string }) =>
    apiClient.post<ApiResponse<ClassWithYear>>('/classes', data),

  updateClass: (id: string, data: { name?: string; academicYear?: string; icon?: string }) =>
    apiClient.put<ApiResponse<ClassWithYear>>(`/classes/${id}`, data),

  deleteClass: (id: string) =>
    apiClient.delete<ApiResponse>(`/classes/${id}`),

  getSections: (classId: string) =>
    apiClient.get<ApiResponse<SectionItem[]>>(`/classes/${classId}/sections`),

  createSection: (classId: string, data: { name: string; academicYear: string }) =>
    apiClient.post<ApiResponse<SectionItem>>(`/classes/${classId}/sections`, data),

  updateSection: (sectionId: string, data: { name: string }) =>
    apiClient.put<ApiResponse<SectionItem>>(`/sections/${sectionId}`, data),

  deleteSection: (sectionId: string) =>
    apiClient.delete<ApiResponse>(`/sections/${sectionId}`),

  getAcademicYears: () =>
    apiClient.get<ApiResponse<(AcademicYear & { isCurrent: boolean })[]>>('/academic-years'),

  createAcademicYear: (data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) =>
    apiClient.post<ApiResponse<AcademicYear>>('/academic-years', data),

  updateAcademicYear: (id: string, data: { name?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) =>
    apiClient.put<ApiResponse<AcademicYear>>(`/academic-years/${id}`, data),

  deleteAcademicYear: (id: string) =>
    apiClient.delete<ApiResponse>(`/academic-years/${id}`),

  assignClass: (teacherId: string, data: { classId: string; academicYear: string; sectionId?: string }) =>
    apiClient.post<ApiResponse>(`/teachers/${teacherId}/assign-class`, data),

  unassignClass: (teacherId: string, data: { classId: string; academicYear: string; sectionId?: string }) =>
    apiClient.delete<ApiResponse>(`/teachers/${teacherId}/assign-class`, { data }),
};

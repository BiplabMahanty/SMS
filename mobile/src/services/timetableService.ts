import apiClient from '../api/client';
import { TimetableEntry, TimetableFormData, TimetableParams } from '../types/timetable';
import { ApiResponse } from '../types/auth';

export const timetableService = {
  getTimetable: (params?: TimetableParams) =>
    apiClient.get<ApiResponse<TimetableEntry[]>>('/timetable', { params }),

  createEntry: (data: TimetableFormData) =>
    apiClient.post<ApiResponse<TimetableEntry>>('/timetable', data),

  updateEntry: (id: string, data: Partial<TimetableFormData>) =>
    apiClient.put<ApiResponse<TimetableEntry>>(`/timetable/${id}`, data),

  deleteEntry: (id: string) =>
    apiClient.delete<ApiResponse>(`/timetable/${id}`),

  getMyTimetableTeacher: (params?: { academicYear?: string; dayOfWeek?: string }) =>
    apiClient.get<ApiResponse<TimetableEntry[]>>('/timetable/me/teacher', { params }),

  getMyTimetableStudent: (params?: { dayOfWeek?: string }) =>
    apiClient.get<ApiResponse<TimetableEntry[]>>('/timetable/me/student', { params }),

  getChildTimetable: (studentId: string, params?: { dayOfWeek?: string }) =>
    apiClient.get<ApiResponse<TimetableEntry[]>>(`/timetable/child/${studentId}`, { params }),
};

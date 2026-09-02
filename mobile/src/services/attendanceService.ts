import apiClient from '../api/client';
import { ApiResponse } from '../types/auth';
import {
  AttendanceRecord,
  AttendanceParams,
  AttendanceSummary,
  ClassAttendanceSummaryItem,
  MarkAttendancePayload,
} from '../types/attendance';

export const attendanceService = {
  markAttendance: (payload: MarkAttendancePayload) =>
    apiClient.post<ApiResponse>('/attendance/mark', payload),

  updateAttendance: (id: string, data: Partial<AttendanceRecord>) =>
    apiClient.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, data),

  getClassAttendance: (params: AttendanceParams) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>('/attendance/class', { params }),

  getAttendanceHistory: (params: AttendanceParams) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>('/attendance/history', { params }),

  // Student
  getMyAttendance: (params?: AttendanceParams) =>
    apiClient.get<ApiResponse<{ records: AttendanceRecord[]; percentage: number }>>('/attendance/me', { params }),

  getMyAttendanceSummary: () =>
    apiClient.get<ApiResponse<AttendanceSummary>>('/attendance/me/summary'),

  // Parent
  getChildAttendance: (studentId: string, params?: AttendanceParams) =>
    apiClient.get<ApiResponse<{ records: AttendanceRecord[]; percentage: number }>>(`/attendance/child/${studentId}`, { params }),

  // Admin
  getStudentReport: (studentId: string, params?: { month?: number; year?: number }) =>
    apiClient.get<ApiResponse<{ student: unknown; records: AttendanceRecord[]; percentage: number }>>(`/attendance/report/student/${studentId}`, { params }),

  getClassReport: (params: AttendanceParams) =>
    apiClient.get<ApiResponse<ClassAttendanceSummaryItem[]>>('/attendance/report/class', { params }),
};

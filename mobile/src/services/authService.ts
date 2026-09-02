import apiClient from '../api/client';
import { LoginPayload, RegisterPayload, LoginResponse, User, ApiResponse } from '../types/auth';

export const authService = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  logout: () =>
    apiClient.post<ApiResponse>('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    ),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),
};

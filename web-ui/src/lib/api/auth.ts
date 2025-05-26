import { apiClient } from './client';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<User> {
    return apiClient.post('/auth/register', userData);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/users/me');
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout', {});
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    return apiClient.put('/users/me', data);
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.post('/users/me/change-password', data);
  },
};

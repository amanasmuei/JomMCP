import { apiClient } from './client';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/api/v1/auth/login', credentials, 'registration');
  },

  async register(userData: RegisterRequest): Promise<User> {
    return apiClient.post('/api/v1/auth/register', userData, 'registration');
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken }, 'registration');
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/api/v1/auth/me', 'registration');
  },

  async logout(): Promise<void> {
    return apiClient.post('/api/v1/auth/logout', {}, 'registration');
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    return apiClient.put('/api/v1/users/me', data, 'registration');
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.post('/api/v1/users/me/change-password', data, 'registration');
  },
};

import { apiClient } from './client';
import { User, LoginRequest, RegisterRequest, TokenResponse } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return apiClient.post('/api/v1/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<User> {
    return apiClient.post('/api/v1/auth/register', userData);
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/api/v1/auth/me');
  },

  async logout(): Promise<void> {
    return apiClient.post('/api/v1/auth/logout');
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    return apiClient.put('/api/v1/users/me', data);
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.post('/api/v1/users/me/change-password', data);
  },
};

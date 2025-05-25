import { apiClient } from './client';
import {
  APIRegistration,
  APIRegistrationCreate,
  APIRegistrationUpdate,
  APIRegistrationList,
  APIValidationRequest,
  APIValidationResponse,
} from '@/types/api';

export const registrationsApi = {
  async list(params?: {
    page?: number;
    size?: number;
    api_type?: string;
    search?: string;
  }): Promise<APIRegistrationList> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());
    if (params?.api_type) searchParams.append('api_type', params.api_type);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return apiClient.get(`/api/v1/registrations${query ? `?${query}` : ''}`, 'registration');
  },

  async get(id: string): Promise<APIRegistration> {
    return apiClient.get(`/api/v1/registrations/${id}`, 'registration');
  },

  async create(data: APIRegistrationCreate): Promise<APIRegistration> {
    return apiClient.post('/api/v1/registrations', data, 'registration');
  },

  async update(id: string, data: APIRegistrationUpdate): Promise<APIRegistration> {
    return apiClient.put(`/api/v1/registrations/${id}`, data, 'registration');
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/registrations/${id}`, 'registration');
  },

  async validate(data: APIValidationRequest): Promise<APIValidationResponse> {
    return apiClient.post('/api/v1/registrations/validate', data, 'registration');
  },
};

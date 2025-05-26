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
    return apiClient.get(`/registrations${query ? `?${query}` : ''}`);
  },

  async get(id: string): Promise<APIRegistration> {
    return apiClient.get(`/registrations/${id}`);
  },

  async create(data: APIRegistrationCreate): Promise<APIRegistration> {
    return apiClient.post('/registrations', data);
  },

  async update(id: string, data: APIRegistrationUpdate): Promise<APIRegistration> {
    return apiClient.put(`/registrations/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/registrations/${id}`);
  },

  async validate(data: APIValidationRequest): Promise<APIValidationResponse> {
    return apiClient.post('/registrations/validate', data);
  },
};

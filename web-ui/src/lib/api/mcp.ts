import { apiClient } from './client';
import {
  MCPServer,
  MCPServerGenerationRequest,
  GenerationStatusResponse,
  MCPServerList,
} from '@/types/mcp';

export const mcpApi = {
  async list(): Promise<MCPServerList> {
    return apiClient.get('/api/v1/generation', {
      baseURL: 'http://localhost:8082',
    });
  },

  async get(id: string): Promise<MCPServer> {
    return apiClient.get(`/api/v1/generation/${id}`, {
      baseURL: 'http://localhost:8082',
    });
  },

  async generate(data: MCPServerGenerationRequest): Promise<MCPServer> {
    return apiClient.post('/api/v1/generation', data, {
      baseURL: 'http://localhost:8082',
    });
  },

  async getStatus(id: string): Promise<GenerationStatusResponse> {
    return apiClient.get(`/api/v1/generation/${id}/status`, {
      baseURL: 'http://localhost:8082',
    });
  },

  async regenerate(id: string): Promise<MCPServer> {
    return apiClient.post(`/api/v1/generation/${id}/regenerate`, {}, {
      baseURL: 'http://localhost:8082',
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/generation/${id}`, {
      baseURL: 'http://localhost:8082',
    });
  },
};

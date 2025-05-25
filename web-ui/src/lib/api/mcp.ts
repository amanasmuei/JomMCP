import { apiClient } from './client';
import {
  MCPServer,
  MCPServerGenerationRequest,
  GenerationStatusResponse,
  MCPServerList,
} from '@/types/mcp';

export const mcpApi = {
  async list(): Promise<MCPServerList> {
    return apiClient.get('/api/v1/generation', 'generator');
  },

  async get(id: string): Promise<MCPServer> {
    return apiClient.get(`/api/v1/generation/${id}`, 'generator');
  },

  async generate(data: MCPServerGenerationRequest): Promise<MCPServer> {
    return apiClient.post('/api/v1/generation', data, 'generator');
  },

  async getStatus(id: string): Promise<GenerationStatusResponse> {
    return apiClient.get(`/api/v1/generation/${id}/status`, 'generator');
  },

  async regenerate(id: string): Promise<MCPServer> {
    return apiClient.post(`/api/v1/generation/${id}/regenerate`, {}, 'generator');
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/generation/${id}`, 'generator');
  },
};

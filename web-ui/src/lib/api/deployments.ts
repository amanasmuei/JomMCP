import { apiClient } from './client';
import {
  Deployment,
  DeploymentCreateRequest,
  DeploymentUpdateRequest,
  DeploymentScaleRequest,
  DeploymentList,
  DeploymentLogsResponse,
} from '@/types/mcp';

export const deploymentsApi = {
  async list(): Promise<DeploymentList> {
    return apiClient.get('/api/v1/deployments', 'deployment');
  },

  async get(id: string): Promise<Deployment> {
    return apiClient.get(`/api/v1/deployments/${id}`, 'deployment');
  },

  async create(data: DeploymentCreateRequest): Promise<Deployment> {
    return apiClient.post('/api/v1/deployments', data, 'deployment');
  },

  async update(id: string, data: DeploymentUpdateRequest): Promise<Deployment> {
    return apiClient.put(`/api/v1/deployments/${id}`, data, 'deployment');
  },

  async scale(id: string, data: DeploymentScaleRequest): Promise<Deployment> {
    return apiClient.post(`/api/v1/deployments/${id}/scale`, data, 'deployment');
  },

  async start(id: string): Promise<Deployment> {
    return apiClient.post(`/api/v1/deployments/${id}/start`, {}, 'deployment');
  },

  async stop(id: string): Promise<Deployment> {
    return apiClient.post(`/api/v1/deployments/${id}/stop`, {}, 'deployment');
  },

  async restart(id: string): Promise<Deployment> {
    return apiClient.post(`/api/v1/deployments/${id}/restart`, {}, 'deployment');
  },

  async getLogs(id: string): Promise<DeploymentLogsResponse> {
    return apiClient.get(`/api/v1/deployments/${id}/logs`, 'deployment');
  },

  async getHealth(id: string): Promise<{ status: string; details?: any }> {
    return apiClient.get(`/api/v1/deployments/${id}/health`, 'deployment');
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/deployments/${id}`, 'deployment');
  },
};

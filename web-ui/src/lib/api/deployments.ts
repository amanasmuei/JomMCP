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
  async list(params?: {
    page?: number;
    size?: number;
    status?: string;
    mcp_server_id?: string;
  }): Promise<DeploymentList> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());
    if (params?.status) searchParams.append('status_filter', params.status);
    if (params?.mcp_server_id) searchParams.append('mcp_server_id', params.mcp_server_id);

    const query = searchParams.toString();
    return apiClient.get(`/deployments${query ? `?${query}` : ''}`);
  },

  async get(id: string): Promise<Deployment> {
    return apiClient.get(`/deployments/${id}`);
  },

  async create(data: DeploymentCreateRequest): Promise<Deployment> {
    return apiClient.post('/deployments', data);
  },

  async update(id: string, data: DeploymentUpdateRequest): Promise<Deployment> {
    return apiClient.put(`/deployments/${id}`, data);
  },

  async scale(id: string, data: DeploymentScaleRequest): Promise<Deployment> {
    return apiClient.post(`/deployments/${id}/scale`, data);
  },

  async start(id: string): Promise<Deployment> {
    return apiClient.post(`/deployments/${id}/start`, {});
  },

  async stop(id: string): Promise<Deployment> {
    return apiClient.post(`/deployments/${id}/stop`, {});
  },

  async restart(id: string): Promise<Deployment> {
    return apiClient.post(`/deployments/${id}/restart`, {});
  },

  async getLogs(id: string): Promise<DeploymentLogsResponse> {
    return apiClient.get(`/deployments/${id}/logs`);
  },

  async getHealth(id: string): Promise<{ status: string; details?: any }> {
    return apiClient.get(`/deployments/${id}/health`);
  },

  async getStatus(id: string): Promise<{ status: string; message?: string }> {
    return apiClient.get(`/deployments/${id}/status`);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/deployments/${id}`);
  },
};

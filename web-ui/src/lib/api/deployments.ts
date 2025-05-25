import { apiClient } from './client';
import { Deployment } from '@/types/mcp';

export interface DeploymentCreateRequest {
  mcp_server_id: string;
  name: string;
  namespace?: string;
  cpu_limit?: string;
  memory_limit?: string;
  replicas?: number;
  port?: number;
  environment_variables?: Record<string, string>;
  deployment_config?: Record<string, any>;
  health_check_path?: string;
}

export interface DeploymentList {
  items: Deployment[];
}

export interface DeploymentLogsResponse {
  deployment_id: string;
  logs: string;
  deployment_logs?: string;
}

export const deploymentsApi = {
  async list(): Promise<DeploymentList> {
    return apiClient.get('/api/v1/deployments', {
      baseURL: 'http://localhost:8083',
    });
  },

  async get(id: string): Promise<Deployment> {
    return apiClient.get(`/api/v1/deployments/${id}`, {
      baseURL: 'http://localhost:8083',
    });
  },

  async create(data: DeploymentCreateRequest): Promise<Deployment> {
    return apiClient.post('/api/v1/deployments', data, {
      baseURL: 'http://localhost:8083',
    });
  },

  async update(id: string, data: Partial<DeploymentCreateRequest>): Promise<Deployment> {
    return apiClient.put(`/api/v1/deployments/${id}`, data, {
      baseURL: 'http://localhost:8083',
    });
  },

  async scale(id: string, replicas: number): Promise<Deployment> {
    return apiClient.post(`/api/v1/deployments/${id}/scale`, { replicas }, {
      baseURL: 'http://localhost:8083',
    });
  },

  async getLogs(id: string): Promise<DeploymentLogsResponse> {
    return apiClient.get(`/api/v1/deployments/${id}/logs`, {
      baseURL: 'http://localhost:8083',
    });
  },

  async stop(id: string): Promise<void> {
    return apiClient.post(`/api/v1/deployments/${id}/stop`, {}, {
      baseURL: 'http://localhost:8083',
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/deployments/${id}`, {
      baseURL: 'http://localhost:8083',
    });
  },
};

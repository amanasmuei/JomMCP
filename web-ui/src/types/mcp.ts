export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'generating' | 'building' | 'ready' | 'deploying' | 'running' | 'stopped' | 'error' | 'failed';
  generated_code_path?: string;
  docker_image_name?: string;
  docker_image_tag?: string;
  mcp_config?: Record<string, any>;
  error_message?: string;
  api_registration_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface MCPServerGenerationRequest {
  api_registration_id: string;
  name: string;
  description?: string;
  mcp_config?: Record<string, any>;
}

export interface GenerationStatusResponse {
  server_id: string;
  status: 'pending' | 'generating' | 'building' | 'ready' | 'deploying' | 'running' | 'stopped' | 'error' | 'failed';
  generation_logs?: string;
  build_logs?: string;
  error_message?: string;
  docker_image_name?: string;
  docker_image_tag?: string;
}

export interface MCPServerList {
  items: MCPServer[];
}

export interface Deployment {
  id: string;
  name: string;
  status: 'pending' | 'deploying' | 'running' | 'scaling' | 'updating' | 'stopping' | 'stopped' | 'failed' | 'error';
  container_name?: string;
  container_id?: string;
  namespace?: string;
  deployment_name?: string;
  service_name?: string;
  cpu_limit?: string;
  memory_limit?: string;
  replicas: number;
  port: number;
  external_url?: string;
  environment_variables?: Record<string, string>;
  deployment_config?: Record<string, any>;
  deployment_logs?: string;
  error_message?: string;
  health_check_path: string;
  mcp_server_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

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

export interface DeploymentUpdateRequest {
  name?: string;
  cpu_limit?: string;
  memory_limit?: string;
  environment_variables?: Record<string, string>;
  deployment_config?: Record<string, any>;
  health_check_path?: string;
}

export interface DeploymentScaleRequest {
  replicas: number;
}

export interface DeploymentList {
  items: Deployment[];
}

export interface DeploymentLogsResponse {
  deployment_id: string;
  logs: string;
  deployment_logs?: string;
}

export interface WebSocketMessage {
  type: 'generation_status' | 'deployment_status' | 'error' | 'notification';
  data: any;
  timestamp: string;
}

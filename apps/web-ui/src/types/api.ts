// API Types for JomMCP Platform

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for frontend compatibility
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface APIRegistration {
  id: string;
  name: string;
  description?: string;
  base_url: string;
  api_type: APIType;
  authentication_type: AuthenticationType;
  status: APIRegistrationStatus;
  specification?: Record<string, any>;
  configuration?: Record<string, any>;
  health_check_url?: string;
  health_check_interval_seconds?: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Additional fields for frontend compatibility
  spec_url?: string;
  headers?: Record<string, string>;
  auth_config?: Record<string, string>;
}

export enum APIRegistrationStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  ACTIVE = 'active',
  VALIDATION_FAILED = 'validation_failed',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum APIType {
  REST = 'rest',
  GRAPHQL = 'graphql',
  SOAP = 'soap',
  GRPC = 'grpc',
  WEBSOCKET = 'websocket',
}

export enum AuthenticationType {
  NONE = 'none',
  API_KEY = 'api_key',
  BEARER_TOKEN = 'bearer_token',
  BASIC_AUTH = 'basic_auth',
  OAUTH2 = 'oauth2',
  CUSTOM = 'custom',
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  status: MCPServerStatus;
  generated_code_path?: string;
  docker_image_name?: string;
  docker_image_tag?: string;
  mcp_config?: Record<string, any>;
  generation_logs?: string;
  build_logs?: string;
  error_message?: string;
  api_registration_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Additional fields for frontend compatibility
  version?: string;
  api_registration?: APIRegistration;
}

export enum MCPServerStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  BUILDING = 'building',
  READY = 'ready',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  FAILED = 'failed',
}

export interface Deployment {
  id: string;
  name: string;
  status: DeploymentStatus;
  container_id?: string;
  container_image?: string;
  endpoint_url?: string;
  health_check_url?: string;
  environment_variables?: Record<string, string>;
  deployment_config?: Record<string, any>;
  cpu_limit?: string;
  memory_limit?: string;
  replica_count?: number;
  last_health_check?: string;
  mcp_server_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Additional fields for frontend compatibility
  environment?: string;
  health?: string;
  url?: string;
  mcp_server?: MCPServer;
}

export enum DeploymentStatus {
  PENDING = 'pending',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  FAILED = 'failed',
  UPDATING = 'updating',
  SCALING = 'scaling',
}

// API Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface PasswordUpdateRequest {
  current_password: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface APIRegistrationCreateRequest {
  name: string;
  description?: string;
  base_url: string;
  api_type: APIType;
  authentication_type: AuthenticationType;
  credentials?: Record<string, string>;
  specification?: Record<string, any>;
  configuration?: Record<string, any>;
  health_check_url?: string;
  health_check_interval_seconds?: number;
}

export interface MCPServerGenerationRequest {
  api_registration_id: string;
  name: string;
  description?: string;
  mcp_config?: Record<string, any>;
}

export interface DeploymentCreateRequest {
  mcp_server_id: string;
  name: string;
  environment_variables?: Record<string, string>;
  deployment_config?: Record<string, any>;
  cpu_limit?: string;
  memory_limit?: string;
  replica_count?: number;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface StatusUpdateMessage extends WebSocketMessage {
  type: 'status_update';
  data: {
    resource_type: 'api_registration' | 'mcp_server' | 'deployment';
    resource_id: string;
    status: string;
    message?: string;
  };
}

export interface LogMessage extends WebSocketMessage {
  type: 'log';
  data: {
    resource_type: 'mcp_server' | 'deployment';
    resource_id: string;
    log_type: 'generation' | 'build' | 'deployment';
    message: string;
    level: 'info' | 'warning' | 'error';
  };
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

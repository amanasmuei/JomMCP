export interface APIRegistration {
  id: string;
  name: string;
  description?: string;
  base_url: string;
  api_type: 'rest' | 'graphql' | 'soap' | 'grpc' | 'websocket';
  authentication_type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
  specification?: Record<string, any>;
  configuration?: Record<string, any>;
  health_check_url?: string;
  health_check_interval_seconds?: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface APIRegistrationCreate {
  name: string;
  description?: string;
  base_url: string;
  api_type: 'rest' | 'graphql' | 'soap' | 'grpc' | 'websocket';
  authentication_type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
  credentials?: Record<string, string>;
  specification?: Record<string, any>;
  configuration?: Record<string, any>;
  health_check_url?: string;
  health_check_interval_seconds?: number;
}

export interface APIRegistrationUpdate {
  name?: string;
  description?: string;
  base_url?: string;
  authentication_type?: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
  credentials?: Record<string, string>;
  specification?: Record<string, any>;
  configuration?: Record<string, any>;
  health_check_url?: string;
  health_check_interval_seconds?: number;
}

export interface APIRegistrationList {
  items: APIRegistration[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface APIValidationRequest {
  base_url: string;
  authentication_type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
  credentials?: Record<string, string>;
  timeout_seconds?: number;
}

export interface APIValidationResponse {
  is_valid: boolean;
  status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  detected_api_type?: 'rest' | 'graphql' | 'soap' | 'grpc' | 'websocket';
  specification?: Record<string, any>;
}

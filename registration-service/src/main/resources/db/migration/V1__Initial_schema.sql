-- MCP Hub Platform - Initial Database Schema
-- This migration creates the core tables for API registrations and MCP server deployments

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- API Registrations table
CREATE TABLE api_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    api_type VARCHAR(50) NOT NULL CHECK (api_type IN ('REST_OPENAPI', 'REST_GENERIC', 'GRAPHQL', 'SOAP', 'GRPC', 'CUSTOM')),
    base_url VARCHAR(500) NOT NULL,
    openapi_spec_url VARCHAR(500),
    graphql_schema_url VARCHAR(500),
    auth_type VARCHAR(50) NOT NULL CHECK (auth_type IN ('NONE', 'API_KEY', 'BASIC_AUTH', 'BEARER_TOKEN', 'OAUTH2_CLIENT_CREDENTIALS', 'OAUTH2_AUTHORIZATION_CODE', 'JWT', 'CUSTOM')),
    auth_config TEXT, -- Encrypted JSON containing authentication details
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALIDATING', 'ACTIVE', 'VALIDATION_FAILED', 'SUSPENDED', 'ARCHIVED')),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_error VARCHAR(1000),
    
    -- Constraints
    CONSTRAINT uk_api_registrations_name_user UNIQUE (name, user_id),
    CONSTRAINT chk_api_registrations_base_url CHECK (base_url ~ '^https?://.*')
);

-- API Endpoints table (for manual endpoint configuration)
CREATE TABLE api_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    http_method VARCHAR(10) NOT NULL CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')),
    path VARCHAR(500) NOT NULL,
    request_schema TEXT, -- JSON schema for request body
    response_schema TEXT, -- JSON schema for response body
    query_parameters TEXT, -- JSON array of query parameter definitions
    path_parameters TEXT, -- JSON array of path parameter definitions
    headers TEXT, -- JSON object of required headers
    content_type VARCHAR(100) DEFAULT 'application/json',
    response_content_type VARCHAR(100) DEFAULT 'application/json',
    requires_auth BOOLEAN DEFAULT true,
    rate_limit INTEGER, -- requests per minute
    timeout_seconds INTEGER DEFAULT 30,
    cache_ttl_seconds INTEGER,
    api_registration_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_api_endpoints_registration FOREIGN KEY (api_registration_id) REFERENCES api_registrations(id) ON DELETE CASCADE,
    
    -- Unique constraints
    CONSTRAINT uk_api_endpoints_name_registration UNIQUE (name, api_registration_id),
    CONSTRAINT uk_api_endpoints_path_method_registration UNIQUE (api_registration_id, path, http_method),
    
    -- Check constraints
    CONSTRAINT chk_api_endpoints_timeout CHECK (timeout_seconds > 0),
    CONSTRAINT chk_api_endpoints_rate_limit CHECK (rate_limit IS NULL OR rate_limit > 0),
    CONSTRAINT chk_api_endpoints_cache_ttl CHECK (cache_ttl_seconds IS NULL OR cache_ttl_seconds > 0)
);

-- MCP Server Deployments table
CREATE TABLE mcp_server_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DEPLOYING', 'RUNNING', 'STOPPING', 'STOPPED', 'FAILED', 'UPDATING', 'SCALING')),
    api_registration_id UUID NOT NULL,
    container_id VARCHAR(100),
    container_image VARCHAR(200),
    container_port INTEGER,
    host_port INTEGER,
    endpoint_url VARCHAR(500),
    health_check_url VARCHAR(500),
    environment_variables TEXT, -- JSON object
    deployment_config TEXT, -- JSON object
    cpu_limit VARCHAR(20),
    memory_limit VARCHAR(20),
    replica_count INTEGER DEFAULT 1,
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(50) CHECK (health_status IN ('UNKNOWN', 'HEALTHY', 'UNHEALTHY', 'DEGRADED', 'STARTING', 'SHUTTING_DOWN')),
    error_message VARCHAR(1000),
    deployment_logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_mcp_deployments_registration FOREIGN KEY (api_registration_id) REFERENCES api_registrations(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_mcp_deployments_replica_count CHECK (replica_count > 0),
    CONSTRAINT chk_mcp_deployments_ports CHECK (container_port IS NULL OR (container_port > 0 AND container_port <= 65535)),
    CONSTRAINT chk_mcp_deployments_host_ports CHECK (host_port IS NULL OR (host_port > 0 AND host_port <= 65535))
);

-- Indexes for performance
CREATE INDEX idx_api_registrations_user_id ON api_registrations(user_id);
CREATE INDEX idx_api_registrations_status ON api_registrations(status);
CREATE INDEX idx_api_registrations_api_type ON api_registrations(api_type);
CREATE INDEX idx_api_registrations_created_at ON api_registrations(created_at);
CREATE INDEX idx_api_registrations_last_validated_at ON api_registrations(last_validated_at);

CREATE INDEX idx_api_endpoints_registration_id ON api_endpoints(api_registration_id);
CREATE INDEX idx_api_endpoints_http_method ON api_endpoints(http_method);
CREATE INDEX idx_api_endpoints_requires_auth ON api_endpoints(requires_auth);

CREATE INDEX idx_mcp_deployments_registration_id ON mcp_server_deployments(api_registration_id);
CREATE INDEX idx_mcp_deployments_status ON mcp_server_deployments(status);
CREATE INDEX idx_mcp_deployments_health_status ON mcp_server_deployments(health_status);
CREATE INDEX idx_mcp_deployments_container_id ON mcp_server_deployments(container_id);
CREATE INDEX idx_mcp_deployments_host_port ON mcp_server_deployments(host_port);
CREATE INDEX idx_mcp_deployments_created_at ON mcp_server_deployments(created_at);
CREATE INDEX idx_mcp_deployments_last_health_check ON mcp_server_deployments(last_health_check);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_api_registrations_updated_at 
    BEFORE UPDATE ON api_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at 
    BEFORE UPDATE ON api_endpoints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_deployments_updated_at 
    BEFORE UPDATE ON mcp_server_deployments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

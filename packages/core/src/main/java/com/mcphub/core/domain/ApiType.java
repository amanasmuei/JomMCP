package com.mcphub.core.domain;

/**
 * Enumeration of supported API types for MCP server generation.
 */
public enum ApiType {
    /**
     * REST API with OpenAPI/Swagger specification
     */
    REST_OPENAPI("REST with OpenAPI", "Generates MCP tools from OpenAPI/Swagger specification"),
    
    /**
     * Generic REST API without formal specification
     */
    REST_GENERIC("Generic REST", "Generates MCP tools from manually configured REST endpoints"),
    
    /**
     * GraphQL API
     */
    GRAPHQL("GraphQL", "Generates MCP tools from GraphQL schema and operations"),
    
    /**
     * SOAP Web Service
     */
    SOAP("SOAP", "Generates MCP tools from WSDL specification"),
    
    /**
     * gRPC Service
     */
    GRPC("gRPC", "Generates MCP tools from Protocol Buffer definitions"),
    
    /**
     * Custom API with user-defined specification
     */
    CUSTOM("Custom", "Generates MCP tools from custom API specification");

    private final String displayName;
    private final String description;

    ApiType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Checks if this API type requires an OpenAPI specification URL.
     */
    public boolean requiresOpenApiSpec() {
        return this == REST_OPENAPI;
    }

    /**
     * Checks if this API type requires a GraphQL schema URL.
     */
    public boolean requiresGraphqlSchema() {
        return this == GRAPHQL;
    }

    /**
     * Checks if this API type supports automatic endpoint discovery.
     */
    public boolean supportsAutoDiscovery() {
        return this == REST_OPENAPI || this == GRAPHQL || this == SOAP || this == GRPC;
    }

    /**
     * Checks if this API type requires manual endpoint configuration.
     */
    public boolean requiresManualConfiguration() {
        return this == REST_GENERIC || this == CUSTOM;
    }
}

package com.mcphub.core.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing an API registration in the MCP Hub platform.
 * Contains all information needed to generate and deploy an MCP server.
 */
@Entity
@Table(name = "api_registrations")
public class ApiRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "API name is required")
    @Size(max = 100, message = "API name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "API type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApiType apiType;

    @NotBlank(message = "Base URL is required")
    @Pattern(regexp = "^https?://.*", message = "Base URL must be a valid HTTP/HTTPS URL")
    @Column(nullable = false, length = 500)
    private String baseUrl;

    @Column(name = "openapi_spec_url", length = 500)
    private String openApiSpecUrl;

    @Column(name = "graphql_schema_url", length = 500)
    private String graphqlSchemaUrl;

    @NotNull(message = "Authentication type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_type", nullable = false)
    private AuthenticationType authType;

    @Lob
    @Column(name = "auth_config")
    private String authConfig; // Encrypted JSON containing auth details

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @OneToMany(mappedBy = "apiRegistration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<McpServerDeployment> deployments = new ArrayList<>();

    @OneToMany(mappedBy = "apiRegistration", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ApiEndpoint> endpoints = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_validated_at")
    private LocalDateTime lastValidatedAt;

    @Column(name = "validation_error", length = 1000)
    private String validationError;

    // Constructors
    public ApiRegistration() {}

    public ApiRegistration(String name, String description, ApiType apiType, 
                          String baseUrl, AuthenticationType authType, UUID userId) {
        this.name = name;
        this.description = description;
        this.apiType = apiType;
        this.baseUrl = baseUrl;
        this.authType = authType;
        this.userId = userId;
        this.status = RegistrationStatus.PENDING;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ApiType getApiType() { return apiType; }
    public void setApiType(ApiType apiType) { this.apiType = apiType; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getOpenApiSpecUrl() { return openApiSpecUrl; }
    public void setOpenApiSpecUrl(String openApiSpecUrl) { this.openApiSpecUrl = openApiSpecUrl; }

    public String getGraphqlSchemaUrl() { return graphqlSchemaUrl; }
    public void setGraphqlSchemaUrl(String graphqlSchemaUrl) { this.graphqlSchemaUrl = graphqlSchemaUrl; }

    public AuthenticationType getAuthType() { return authType; }
    public void setAuthType(AuthenticationType authType) { this.authType = authType; }

    public String getAuthConfig() { return authConfig; }
    public void setAuthConfig(String authConfig) { this.authConfig = authConfig; }

    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public List<McpServerDeployment> getDeployments() { return deployments; }
    public void setDeployments(List<McpServerDeployment> deployments) { this.deployments = deployments; }

    public List<ApiEndpoint> getEndpoints() { return endpoints; }
    public void setEndpoints(List<ApiEndpoint> endpoints) { this.endpoints = endpoints; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastValidatedAt() { return lastValidatedAt; }
    public void setLastValidatedAt(LocalDateTime lastValidatedAt) { this.lastValidatedAt = lastValidatedAt; }

    public String getValidationError() { return validationError; }
    public void setValidationError(String validationError) { this.validationError = validationError; }

    // Helper methods
    public void addEndpoint(ApiEndpoint endpoint) {
        endpoints.add(endpoint);
        endpoint.setApiRegistration(this);
    }

    public void addDeployment(McpServerDeployment deployment) {
        deployments.add(deployment);
        deployment.setApiRegistration(this);
    }

    public boolean isActive() {
        return status == RegistrationStatus.ACTIVE;
    }

    public boolean hasValidDeployment() {
        return deployments.stream()
                .anyMatch(deployment -> deployment.getStatus() == DeploymentStatus.RUNNING);
    }
}

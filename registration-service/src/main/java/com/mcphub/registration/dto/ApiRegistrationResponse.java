package com.mcphub.registration.dto;

import com.mcphub.core.domain.ApiType;
import com.mcphub.core.domain.AuthenticationType;
import com.mcphub.core.domain.RegistrationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for API registration responses.
 */
public class ApiRegistrationResponse {

    private UUID id;
    private String name;
    private String description;
    private ApiType apiType;
    private String baseUrl;
    private String openApiSpecUrl;
    private String graphqlSchemaUrl;
    private AuthenticationType authType;
    private RegistrationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastValidatedAt;
    private String validationError;
    private int endpointCount;
    private int deploymentCount;

    // Constructors
    public ApiRegistrationResponse() {}

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ApiType getApiType() {
        return apiType;
    }

    public void setApiType(ApiType apiType) {
        this.apiType = apiType;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getOpenApiSpecUrl() {
        return openApiSpecUrl;
    }

    public void setOpenApiSpecUrl(String openApiSpecUrl) {
        this.openApiSpecUrl = openApiSpecUrl;
    }

    public String getGraphqlSchemaUrl() {
        return graphqlSchemaUrl;
    }

    public void setGraphqlSchemaUrl(String graphqlSchemaUrl) {
        this.graphqlSchemaUrl = graphqlSchemaUrl;
    }

    public AuthenticationType getAuthType() {
        return authType;
    }

    public void setAuthType(AuthenticationType authType) {
        this.authType = authType;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastValidatedAt() {
        return lastValidatedAt;
    }

    public void setLastValidatedAt(LocalDateTime lastValidatedAt) {
        this.lastValidatedAt = lastValidatedAt;
    }

    public String getValidationError() {
        return validationError;
    }

    public void setValidationError(String validationError) {
        this.validationError = validationError;
    }

    public int getEndpointCount() {
        return endpointCount;
    }

    public void setEndpointCount(int endpointCount) {
        this.endpointCount = endpointCount;
    }

    public int getDeploymentCount() {
        return deploymentCount;
    }

    public void setDeploymentCount(int deploymentCount) {
        this.deploymentCount = deploymentCount;
    }

    @Override
    public String toString() {
        return "ApiRegistrationResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", apiType=" + apiType +
                ", baseUrl='" + baseUrl + '\'' +
                ", authType=" + authType +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", endpointCount=" + endpointCount +
                ", deploymentCount=" + deploymentCount +
                '}';
    }
}

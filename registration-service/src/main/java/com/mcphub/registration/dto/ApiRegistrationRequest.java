package com.mcphub.registration.dto;

import com.mcphub.core.domain.ApiType;
import com.mcphub.core.domain.AuthenticationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for API registration requests.
 */
public class ApiRegistrationRequest {

    @NotBlank(message = "API name is required")
    @Size(max = 100, message = "API name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "API type is required")
    private ApiType apiType;

    @NotBlank(message = "Base URL is required")
    @Pattern(regexp = "^https?://.*", message = "Base URL must be a valid HTTP/HTTPS URL")
    private String baseUrl;

    private String openApiSpecUrl;

    private String graphqlSchemaUrl;

    @NotNull(message = "Authentication type is required")
    private AuthenticationType authType;

    private String authConfig; // JSON string containing auth details

    // Constructors
    public ApiRegistrationRequest() {}

    public ApiRegistrationRequest(String name, ApiType apiType, String baseUrl, AuthenticationType authType) {
        this.name = name;
        this.apiType = apiType;
        this.baseUrl = baseUrl;
        this.authType = authType;
    }

    // Getters and Setters
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

    public String getAuthConfig() {
        return authConfig;
    }

    public void setAuthConfig(String authConfig) {
        this.authConfig = authConfig;
    }

    @Override
    public String toString() {
        return "ApiRegistrationRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", apiType=" + apiType +
                ", baseUrl='" + baseUrl + '\'' +
                ", openApiSpecUrl='" + openApiSpecUrl + '\'' +
                ", graphqlSchemaUrl='" + graphqlSchemaUrl + '\'' +
                ", authType=" + authType +
                ", authConfig='[REDACTED]'" +
                '}';
    }
}

package com.mcphub.core.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing an individual API endpoint within an API registration.
 * Used for manual endpoint configuration in REST_GENERIC and CUSTOM API types.
 */
@Entity
@Table(name = "api_endpoints")
public class ApiEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Endpoint name is required")
    @Size(max = 100, message = "Endpoint name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotBlank(message = "HTTP method is required")
    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod; // GET, POST, PUT, DELETE, PATCH, etc.

    @NotBlank(message = "Path is required")
    @Column(nullable = false, length = 500)
    private String path; // e.g., "/users/{id}", "/api/v1/products"

    @Column(name = "request_schema", columnDefinition = "TEXT")
    private String requestSchema; // JSON schema for request body

    @Column(name = "response_schema", columnDefinition = "TEXT")
    private String responseSchema; // JSON schema for response body

    @Column(name = "query_parameters", columnDefinition = "TEXT")
    private String queryParameters; // JSON array of query parameter definitions

    @Column(name = "path_parameters", columnDefinition = "TEXT")
    private String pathParameters; // JSON array of path parameter definitions

    @Column(name = "headers", columnDefinition = "TEXT")
    private String headers; // JSON object of required headers

    @Column(name = "content_type", length = 100)
    private String contentType = "application/json";

    @Column(name = "response_content_type", length = 100)
    private String responseContentType = "application/json";

    @Column(name = "requires_auth")
    private Boolean requiresAuth = true;

    @Column(name = "rate_limit")
    private Integer rateLimit; // requests per minute

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 30;

    @Column(name = "cache_ttl_seconds")
    private Integer cacheTtlSeconds;

    @NotNull(message = "API registration is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_registration_id", nullable = false)
    private ApiRegistration apiRegistration;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public ApiEndpoint() {}

    public ApiEndpoint(String name, String httpMethod, String path, ApiRegistration apiRegistration) {
        this.name = name;
        this.httpMethod = httpMethod;
        this.path = path;
        this.apiRegistration = apiRegistration;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHttpMethod() { return httpMethod; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getRequestSchema() { return requestSchema; }
    public void setRequestSchema(String requestSchema) { this.requestSchema = requestSchema; }

    public String getResponseSchema() { return responseSchema; }
    public void setResponseSchema(String responseSchema) { this.responseSchema = responseSchema; }

    public String getQueryParameters() { return queryParameters; }
    public void setQueryParameters(String queryParameters) { this.queryParameters = queryParameters; }

    public String getPathParameters() { return pathParameters; }
    public void setPathParameters(String pathParameters) { this.pathParameters = pathParameters; }

    public String getHeaders() { return headers; }
    public void setHeaders(String headers) { this.headers = headers; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getResponseContentType() { return responseContentType; }
    public void setResponseContentType(String responseContentType) { this.responseContentType = responseContentType; }

    public Boolean getRequiresAuth() { return requiresAuth; }
    public void setRequiresAuth(Boolean requiresAuth) { this.requiresAuth = requiresAuth; }

    public Integer getRateLimit() { return rateLimit; }
    public void setRateLimit(Integer rateLimit) { this.rateLimit = rateLimit; }

    public Integer getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(Integer timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }

    public Integer getCacheTtlSeconds() { return cacheTtlSeconds; }
    public void setCacheTtlSeconds(Integer cacheTtlSeconds) { this.cacheTtlSeconds = cacheTtlSeconds; }

    public ApiRegistration getApiRegistration() { return apiRegistration; }
    public void setApiRegistration(ApiRegistration apiRegistration) { this.apiRegistration = apiRegistration; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public String getFullPath() {
        return apiRegistration != null ? apiRegistration.getBaseUrl() + path : path;
    }

    public boolean isGetMethod() {
        return "GET".equalsIgnoreCase(httpMethod);
    }

    public boolean isPostMethod() {
        return "POST".equalsIgnoreCase(httpMethod);
    }

    public boolean isPutMethod() {
        return "PUT".equalsIgnoreCase(httpMethod);
    }

    public boolean isDeleteMethod() {
        return "DELETE".equalsIgnoreCase(httpMethod);
    }

    public boolean isPatchMethod() {
        return "PATCH".equalsIgnoreCase(httpMethod);
    }

    public boolean hasRequestBody() {
        return isPostMethod() || isPutMethod() || isPatchMethod();
    }

    public boolean isCacheable() {
        return isGetMethod() && cacheTtlSeconds != null && cacheTtlSeconds > 0;
    }
}

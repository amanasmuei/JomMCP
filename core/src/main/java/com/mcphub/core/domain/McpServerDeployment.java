package com.mcphub.core.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a deployed MCP server instance.
 */
@Entity
@Table(name = "mcp_server_deployments")
public class McpServerDeployment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Server name is required")
    @Column(name = "server_name", nullable = false, length = 100)
    private String serverName;

    @NotBlank(message = "Version is required")
    @Column(nullable = false, length = 20)
    private String version;

    @NotNull(message = "Deployment status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeploymentStatus status = DeploymentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_registration_id", nullable = false)
    private ApiRegistration apiRegistration;

    @Column(name = "container_id", length = 100)
    private String containerId;

    @Column(name = "container_image", length = 200)
    private String containerImage;

    @Column(name = "container_port")
    private Integer containerPort;

    @Column(name = "host_port")
    private Integer hostPort;

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "health_check_url", length = 500)
    private String healthCheckUrl;

    @Lob
    @Column(name = "environment_variables")
    private String environmentVariables; // JSON

    @Lob
    @Column(name = "deployment_config")
    private String deploymentConfig; // JSON

    @Column(name = "cpu_limit")
    private String cpuLimit;

    @Column(name = "memory_limit")
    private String memoryLimit;

    @Column(name = "replica_count")
    private Integer replicaCount = 1;

    @Column(name = "last_health_check")
    private LocalDateTime lastHealthCheck;

    @Column(name = "health_status")
    @Enumerated(EnumType.STRING)
    private HealthStatus healthStatus;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "deployment_logs", columnDefinition = "TEXT")
    private String deploymentLogs;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "stopped_at")
    private LocalDateTime stoppedAt;

    // Constructors
    public McpServerDeployment() {}

    public McpServerDeployment(String serverName, String version, ApiRegistration apiRegistration) {
        this.serverName = serverName;
        this.version = version;
        this.apiRegistration = apiRegistration;
        this.status = DeploymentStatus.PENDING;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getServerName() { return serverName; }
    public void setServerName(String serverName) { this.serverName = serverName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public DeploymentStatus getStatus() { return status; }
    public void setStatus(DeploymentStatus status) { this.status = status; }

    public ApiRegistration getApiRegistration() { return apiRegistration; }
    public void setApiRegistration(ApiRegistration apiRegistration) { this.apiRegistration = apiRegistration; }

    public String getContainerId() { return containerId; }
    public void setContainerId(String containerId) { this.containerId = containerId; }

    public String getContainerImage() { return containerImage; }
    public void setContainerImage(String containerImage) { this.containerImage = containerImage; }

    public Integer getContainerPort() { return containerPort; }
    public void setContainerPort(Integer containerPort) { this.containerPort = containerPort; }

    public Integer getHostPort() { return hostPort; }
    public void setHostPort(Integer hostPort) { this.hostPort = hostPort; }

    public String getEndpointUrl() { return endpointUrl; }
    public void setEndpointUrl(String endpointUrl) { this.endpointUrl = endpointUrl; }

    public String getHealthCheckUrl() { return healthCheckUrl; }
    public void setHealthCheckUrl(String healthCheckUrl) { this.healthCheckUrl = healthCheckUrl; }

    public String getEnvironmentVariables() { return environmentVariables; }
    public void setEnvironmentVariables(String environmentVariables) { this.environmentVariables = environmentVariables; }

    public String getDeploymentConfig() { return deploymentConfig; }
    public void setDeploymentConfig(String deploymentConfig) { this.deploymentConfig = deploymentConfig; }

    public String getCpuLimit() { return cpuLimit; }
    public void setCpuLimit(String cpuLimit) { this.cpuLimit = cpuLimit; }

    public String getMemoryLimit() { return memoryLimit; }
    public void setMemoryLimit(String memoryLimit) { this.memoryLimit = memoryLimit; }

    public Integer getReplicaCount() { return replicaCount; }
    public void setReplicaCount(Integer replicaCount) { this.replicaCount = replicaCount; }

    public LocalDateTime getLastHealthCheck() { return lastHealthCheck; }
    public void setLastHealthCheck(LocalDateTime lastHealthCheck) { this.lastHealthCheck = lastHealthCheck; }

    public HealthStatus getHealthStatus() { return healthStatus; }
    public void setHealthStatus(HealthStatus healthStatus) { this.healthStatus = healthStatus; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getDeploymentLogs() { return deploymentLogs; }
    public void setDeploymentLogs(String deploymentLogs) { this.deploymentLogs = deploymentLogs; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getStoppedAt() { return stoppedAt; }
    public void setStoppedAt(LocalDateTime stoppedAt) { this.stoppedAt = stoppedAt; }

    // Helper methods
    public boolean isRunning() {
        return status == DeploymentStatus.RUNNING;
    }

    public boolean isHealthy() {
        return healthStatus == HealthStatus.HEALTHY;
    }

    public void markAsStarted() {
        this.status = DeploymentStatus.RUNNING;
        this.startedAt = LocalDateTime.now();
        this.stoppedAt = null;
    }

    public void markAsStopped() {
        this.status = DeploymentStatus.STOPPED;
        this.stoppedAt = LocalDateTime.now();
    }

    public void markAsFailed(String errorMessage) {
        this.status = DeploymentStatus.FAILED;
        this.errorMessage = errorMessage;
        this.stoppedAt = LocalDateTime.now();
    }
}

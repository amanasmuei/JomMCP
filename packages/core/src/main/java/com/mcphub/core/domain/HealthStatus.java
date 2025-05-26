package com.mcphub.core.domain;

/**
 * Enumeration of health statuses for deployed MCP servers.
 */
public enum HealthStatus {
    /**
     * Health status is unknown or not yet checked
     */
    UNKNOWN("Unknown", "Health status has not been determined"),
    
    /**
     * Server is healthy and responding
     */
    HEALTHY("Healthy", "Server is responding to health checks"),
    
    /**
     * Server is unhealthy but still running
     */
    UNHEALTHY("Unhealthy", "Server is not responding to health checks"),
    
    /**
     * Server is degraded but partially functional
     */
    DEGRADED("Degraded", "Server is responding but with degraded performance"),
    
    /**
     * Server is starting up
     */
    STARTING("Starting", "Server is in the process of starting up"),
    
    /**
     * Server is shutting down
     */
    SHUTTING_DOWN("Shutting Down", "Server is in the process of shutting down");

    private final String displayName;
    private final String description;

    HealthStatus(String displayName, String description) {
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
     * Checks if the health status indicates the server is operational.
     */
    public boolean isOperational() {
        return this == HEALTHY || this == DEGRADED;
    }

    /**
     * Checks if the health status indicates a problem.
     */
    public boolean indicatesProblem() {
        return this == UNHEALTHY;
    }

    /**
     * Checks if the health status is transitional.
     */
    public boolean isTransitional() {
        return this == STARTING || this == SHUTTING_DOWN;
    }

    /**
     * Checks if health monitoring should continue.
     */
    public boolean shouldContinueMonitoring() {
        return this != SHUTTING_DOWN;
    }
}

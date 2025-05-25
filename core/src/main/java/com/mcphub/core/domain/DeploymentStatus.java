package com.mcphub.core.domain;

/**
 * Enumeration of MCP server deployment statuses.
 */
public enum DeploymentStatus {
    /**
     * Deployment is pending
     */
    PENDING("Pending", "Deployment is queued and waiting to start"),
    
    /**
     * Deployment is in progress
     */
    DEPLOYING("Deploying", "MCP server is being deployed"),
    
    /**
     * Deployment is running successfully
     */
    RUNNING("Running", "MCP server is running and healthy"),
    
    /**
     * Deployment is stopping
     */
    STOPPING("Stopping", "MCP server is being stopped"),
    
    /**
     * Deployment is stopped
     */
    STOPPED("Stopped", "MCP server has been stopped"),
    
    /**
     * Deployment failed
     */
    FAILED("Failed", "MCP server deployment failed"),
    
    /**
     * Deployment is being updated
     */
    UPDATING("Updating", "MCP server is being updated to a new version"),
    
    /**
     * Deployment is scaling
     */
    SCALING("Scaling", "MCP server replicas are being scaled");

    private final String displayName;
    private final String description;

    DeploymentStatus(String displayName, String description) {
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
     * Checks if the deployment is in a running state.
     */
    public boolean isRunning() {
        return this == RUNNING;
    }

    /**
     * Checks if the deployment is in a transitional state.
     */
    public boolean isTransitional() {
        return this == PENDING || this == DEPLOYING || this == STOPPING || this == UPDATING || this == SCALING;
    }

    /**
     * Checks if the deployment is in a final state.
     */
    public boolean isFinalState() {
        return this == STOPPED || this == FAILED;
    }

    /**
     * Checks if the deployment can be stopped.
     */
    public boolean canBeStopped() {
        return this == RUNNING || this == UPDATING || this == SCALING;
    }

    /**
     * Checks if the deployment can be restarted.
     */
    public boolean canBeRestarted() {
        return this == STOPPED || this == FAILED;
    }

    /**
     * Checks if the deployment can be updated.
     */
    public boolean canBeUpdated() {
        return this == RUNNING;
    }

    /**
     * Checks if the deployment can be scaled.
     */
    public boolean canBeScaled() {
        return this == RUNNING;
    }
}

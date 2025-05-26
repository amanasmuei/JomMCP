package com.mcphub.core.domain;

/**
 * Enumeration of API registration statuses in the MCP Hub platform.
 */
public enum RegistrationStatus {
    /**
     * Registration is pending validation
     */
    PENDING("Pending", "Registration is pending validation"),
    
    /**
     * Registration is being validated
     */
    VALIDATING("Validating", "API endpoints and authentication are being validated"),
    
    /**
     * Registration is active and ready for MCP server generation
     */
    ACTIVE("Active", "Registration is validated and ready for use"),
    
    /**
     * Registration validation failed
     */
    VALIDATION_FAILED("Validation Failed", "API validation failed - check configuration"),
    
    /**
     * Registration is temporarily suspended
     */
    SUSPENDED("Suspended", "Registration is temporarily suspended"),
    
    /**
     * Registration is archived/inactive
     */
    ARCHIVED("Archived", "Registration is archived and no longer active");

    private final String displayName;
    private final String description;

    RegistrationStatus(String displayName, String description) {
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
     * Checks if the registration is in a state that allows MCP server generation.
     */
    public boolean allowsGeneration() {
        return this == ACTIVE;
    }

    /**
     * Checks if the registration is in a state that allows deployment.
     */
    public boolean allowsDeployment() {
        return this == ACTIVE;
    }

    /**
     * Checks if the registration is in a final state (no further processing expected).
     */
    public boolean isFinalState() {
        return this == ARCHIVED;
    }

    /**
     * Checks if the registration is in an error state.
     */
    public boolean isErrorState() {
        return this == VALIDATION_FAILED;
    }

    /**
     * Checks if the registration can be edited.
     */
    public boolean allowsEditing() {
        return this == PENDING || this == VALIDATION_FAILED || this == ACTIVE;
    }
}

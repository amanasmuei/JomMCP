package com.mcphub.core.domain;

/**
 * Enumeration of supported authentication types for API access.
 */
public enum AuthenticationType {
    /**
     * No authentication required
     */
    NONE("None", "No authentication required"),
    
    /**
     * API Key authentication (header, query parameter, or custom)
     */
    API_KEY("API Key", "Authentication using API key in header or query parameter"),
    
    /**
     * Basic HTTP authentication
     */
    BASIC_AUTH("Basic Auth", "HTTP Basic authentication with username and password"),
    
    /**
     * Bearer token authentication
     */
    BEARER_TOKEN("Bearer Token", "Authentication using Bearer token in Authorization header"),
    
    /**
     * OAuth 2.0 Client Credentials flow
     */
    OAUTH2_CLIENT_CREDENTIALS("OAuth 2.0 Client Credentials", "OAuth 2.0 Client Credentials grant flow"),
    
    /**
     * OAuth 2.0 Authorization Code flow
     */
    OAUTH2_AUTHORIZATION_CODE("OAuth 2.0 Authorization Code", "OAuth 2.0 Authorization Code grant flow"),
    
    /**
     * JWT token authentication
     */
    JWT("JWT", "JSON Web Token authentication"),
    
    /**
     * Custom authentication mechanism
     */
    CUSTOM("Custom", "Custom authentication mechanism with user-defined headers/parameters");

    private final String displayName;
    private final String description;

    AuthenticationType(String displayName, String description) {
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
     * Checks if this authentication type requires credentials to be stored.
     */
    public boolean requiresCredentials() {
        return this != NONE;
    }

    /**
     * Checks if this authentication type requires OAuth configuration.
     */
    public boolean requiresOAuthConfig() {
        return this == OAUTH2_CLIENT_CREDENTIALS || this == OAUTH2_AUTHORIZATION_CODE;
    }

    /**
     * Checks if this authentication type supports token refresh.
     */
    public boolean supportsTokenRefresh() {
        return this == OAUTH2_CLIENT_CREDENTIALS || this == OAUTH2_AUTHORIZATION_CODE;
    }

    /**
     * Checks if this authentication type requires user interaction for setup.
     */
    public boolean requiresUserInteraction() {
        return this == OAUTH2_AUTHORIZATION_CODE;
    }
}

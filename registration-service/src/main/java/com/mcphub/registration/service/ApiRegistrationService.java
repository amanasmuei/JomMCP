package com.mcphub.registration.service;

import com.mcphub.core.domain.ApiRegistration;
import com.mcphub.core.domain.RegistrationStatus;
import com.mcphub.core.repository.ApiRegistrationRepository;
import com.mcphub.registration.dto.ApiRegistrationRequest;
import com.mcphub.registration.dto.ApiRegistrationResponse;
import com.mcphub.registration.exception.ApiRegistrationException;
import com.mcphub.registration.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for managing API registrations.
 */
@Service
@Transactional
public class ApiRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(ApiRegistrationService.class);

    private final ApiRegistrationRepository apiRegistrationRepository;
    private final ApiValidationService apiValidationService;
    private final CredentialEncryptionService credentialEncryptionService;

    @Autowired
    public ApiRegistrationService(
            ApiRegistrationRepository apiRegistrationRepository,
            ApiValidationService apiValidationService,
            CredentialEncryptionService credentialEncryptionService) {
        this.apiRegistrationRepository = apiRegistrationRepository;
        this.apiValidationService = apiValidationService;
        this.credentialEncryptionService = credentialEncryptionService;
    }

    /**
     * Create a new API registration.
     */
    public ApiRegistrationResponse createRegistration(ApiRegistrationRequest request, UUID userId) {
        logger.info("Creating API registration for user: {}, name: {}", userId, request.getName());

        // Check if registration with same name already exists for user
        if (apiRegistrationRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new ApiRegistrationException("API registration with name '" + request.getName() + "' already exists");
        }

        // Create new registration entity
        ApiRegistration registration = new ApiRegistration(
                request.getName(),
                request.getDescription(),
                request.getApiType(),
                request.getBaseUrl(),
                request.getAuthType(),
                userId
        );

        // Set optional fields
        registration.setOpenApiSpecUrl(request.getOpenApiSpecUrl());
        registration.setGraphqlSchemaUrl(request.getGraphqlSchemaUrl());

        // Encrypt and store authentication configuration
        if (request.getAuthConfig() != null && !request.getAuthConfig().isEmpty()) {
            String encryptedAuthConfig = credentialEncryptionService.encrypt(request.getAuthConfig());
            registration.setAuthConfig(encryptedAuthConfig);
        }

        // Save registration
        registration = apiRegistrationRepository.save(registration);

        // Start async validation if enabled
        apiValidationService.validateRegistrationAsync(registration.getId());

        logger.info("Created API registration with ID: {}", registration.getId());
        return mapToResponse(registration);
    }

    /**
     * Get API registration by ID.
     */
    @Transactional(readOnly = true)
    public ApiRegistrationResponse getRegistration(UUID registrationId, UUID userId) {
        ApiRegistration registration = findRegistrationByIdAndUser(registrationId, userId);
        return mapToResponse(registration);
    }

    /**
     * Get all API registrations for a user.
     */
    @Transactional(readOnly = true)
    public Page<ApiRegistrationResponse> getUserRegistrations(UUID userId, Pageable pageable) {
        Page<ApiRegistration> registrations = apiRegistrationRepository.findByUserId(userId, pageable);
        return registrations.map(this::mapToResponse);
    }

    /**
     * Update an existing API registration.
     */
    public ApiRegistrationResponse updateRegistration(UUID registrationId, ApiRegistrationRequest request, UUID userId) {
        logger.info("Updating API registration: {} for user: {}", registrationId, userId);

        ApiRegistration registration = findRegistrationByIdAndUser(registrationId, userId);

        // Check if name is being changed and if it conflicts
        if (!registration.getName().equals(request.getName()) &&
            apiRegistrationRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new ApiRegistrationException("API registration with name '" + request.getName() + "' already exists");
        }

        // Update fields
        registration.setName(request.getName());
        registration.setDescription(request.getDescription());
        registration.setApiType(request.getApiType());
        registration.setBaseUrl(request.getBaseUrl());
        registration.setAuthType(request.getAuthType());
        registration.setOpenApiSpecUrl(request.getOpenApiSpecUrl());
        registration.setGraphqlSchemaUrl(request.getGraphqlSchemaUrl());

        // Update authentication configuration if provided
        if (request.getAuthConfig() != null && !request.getAuthConfig().isEmpty()) {
            String encryptedAuthConfig = credentialEncryptionService.encrypt(request.getAuthConfig());
            registration.setAuthConfig(encryptedAuthConfig);
        }

        // Reset validation status to trigger re-validation
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setLastValidatedAt(null);
        registration.setValidationError(null);

        registration = apiRegistrationRepository.save(registration);

        // Start async validation
        apiValidationService.validateRegistrationAsync(registration.getId());

        logger.info("Updated API registration: {}", registrationId);
        return mapToResponse(registration);
    }

    /**
     * Delete an API registration.
     */
    public void deleteRegistration(UUID registrationId, UUID userId) {
        logger.info("Deleting API registration: {} for user: {}", registrationId, userId);

        ApiRegistration registration = findRegistrationByIdAndUser(registrationId, userId);

        // Check if there are active deployments
        if (!registration.getDeployments().isEmpty()) {
            boolean hasActiveDeployments = registration.getDeployments().stream()
                    .anyMatch(deployment -> deployment.getStatus().isRunning());
            
            if (hasActiveDeployments) {
                throw new ApiRegistrationException("Cannot delete API registration with active deployments");
            }
        }

        apiRegistrationRepository.delete(registration);
        logger.info("Deleted API registration: {}", registrationId);
    }

    /**
     * Validate an API registration manually.
     */
    public ApiRegistrationResponse validateRegistration(UUID registrationId, UUID userId) {
        logger.info("Manually validating API registration: {} for user: {}", registrationId, userId);

        ApiRegistration registration = findRegistrationByIdAndUser(registrationId, userId);
        
        // Start validation
        apiValidationService.validateRegistrationAsync(registration.getId());
        
        return mapToResponse(registration);
    }

    /**
     * Get active registrations for a user.
     */
    @Transactional(readOnly = true)
    public List<ApiRegistrationResponse> getActiveRegistrations(UUID userId) {
        List<ApiRegistration> registrations = apiRegistrationRepository.findActiveRegistrationsByUserId(userId);
        return registrations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search registrations by name or description.
     */
    @Transactional(readOnly = true)
    public Page<ApiRegistrationResponse> searchRegistrations(UUID userId, String searchTerm, Pageable pageable) {
        Page<ApiRegistration> registrations = apiRegistrationRepository
                .searchByNameOrDescription(userId, searchTerm, pageable);
        return registrations.map(this::mapToResponse);
    }

    // Helper methods

    private ApiRegistration findRegistrationByIdAndUser(UUID registrationId, UUID userId) {
        return apiRegistrationRepository.findById(registrationId)
                .filter(registration -> registration.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("API registration not found: " + registrationId));
    }

    private ApiRegistrationResponse mapToResponse(ApiRegistration registration) {
        ApiRegistrationResponse response = new ApiRegistrationResponse();
        response.setId(registration.getId());
        response.setName(registration.getName());
        response.setDescription(registration.getDescription());
        response.setApiType(registration.getApiType());
        response.setBaseUrl(registration.getBaseUrl());
        response.setOpenApiSpecUrl(registration.getOpenApiSpecUrl());
        response.setGraphqlSchemaUrl(registration.getGraphqlSchemaUrl());
        response.setAuthType(registration.getAuthType());
        response.setStatus(registration.getStatus());
        response.setCreatedAt(registration.getCreatedAt());
        response.setUpdatedAt(registration.getUpdatedAt());
        response.setLastValidatedAt(registration.getLastValidatedAt());
        response.setValidationError(registration.getValidationError());
        response.setEndpointCount(registration.getEndpoints().size());
        response.setDeploymentCount(registration.getDeployments().size());
        
        // Don't include encrypted auth config in response
        return response;
    }
}

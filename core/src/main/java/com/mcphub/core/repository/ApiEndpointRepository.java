package com.mcphub.core.repository;

import com.mcphub.core.domain.ApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for ApiEndpoint entities.
 */
@Repository
public interface ApiEndpointRepository extends JpaRepository<ApiEndpoint, UUID> {

    /**
     * Find all endpoints for a specific API registration.
     */
    List<ApiEndpoint> findByApiRegistrationId(UUID apiRegistrationId);

    /**
     * Find endpoints by HTTP method.
     */
    List<ApiEndpoint> findByHttpMethod(String httpMethod);

    /**
     * Find endpoints by HTTP method for a specific API registration.
     */
    List<ApiEndpoint> findByApiRegistrationIdAndHttpMethod(UUID apiRegistrationId, String httpMethod);

    /**
     * Find endpoint by name and API registration (names should be unique per registration).
     */
    Optional<ApiEndpoint> findByNameAndApiRegistrationId(String name, UUID apiRegistrationId);

    /**
     * Check if an endpoint with the given name exists for an API registration.
     */
    boolean existsByNameAndApiRegistrationId(String name, UUID apiRegistrationId);

    /**
     * Find endpoints by path pattern.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.path LIKE %:pathPattern%")
    List<ApiEndpoint> findByPathContaining(@Param("pathPattern") String pathPattern);

    /**
     * Find endpoints that require authentication.
     */
    List<ApiEndpoint> findByRequiresAuth(Boolean requiresAuth);

    /**
     * Find endpoints with rate limiting.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.rateLimit IS NOT NULL AND e.rateLimit > 0")
    List<ApiEndpoint> findEndpointsWithRateLimit();

    /**
     * Find cacheable endpoints.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.cacheTtlSeconds IS NOT NULL AND e.cacheTtlSeconds > 0")
    List<ApiEndpoint> findCacheableEndpoints();

    /**
     * Find GET endpoints for an API registration.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.apiRegistration.id = :apiRegistrationId " +
           "AND UPPER(e.httpMethod) = 'GET'")
    List<ApiEndpoint> findGetEndpointsByApiRegistrationId(@Param("apiRegistrationId") UUID apiRegistrationId);

    /**
     * Find POST endpoints for an API registration.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.apiRegistration.id = :apiRegistrationId " +
           "AND UPPER(e.httpMethod) = 'POST'")
    List<ApiEndpoint> findPostEndpointsByApiRegistrationId(@Param("apiRegistrationId") UUID apiRegistrationId);

    /**
     * Find endpoints by content type.
     */
    List<ApiEndpoint> findByContentType(String contentType);

    /**
     * Count endpoints for an API registration.
     */
    long countByApiRegistrationId(UUID apiRegistrationId);

    /**
     * Count endpoints by HTTP method for an API registration.
     */
    long countByApiRegistrationIdAndHttpMethod(UUID apiRegistrationId, String httpMethod);

    /**
     * Find endpoints for a user (through API registration).
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.apiRegistration.userId = :userId")
    List<ApiEndpoint> findByUserId(@Param("userId") UUID userId);

    /**
     * Search endpoints by name or description.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.apiRegistration.id = :apiRegistrationId " +
           "AND (LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ApiEndpoint> searchByNameOrDescription(@Param("apiRegistrationId") UUID apiRegistrationId, 
                                                @Param("searchTerm") String searchTerm);

    /**
     * Find endpoints with specific timeout settings.
     */
    @Query("SELECT e FROM ApiEndpoint e WHERE e.timeoutSeconds > :timeoutThreshold")
    List<ApiEndpoint> findEndpointsWithLongTimeout(@Param("timeoutThreshold") Integer timeoutThreshold);

    /**
     * Find endpoints by path and HTTP method for an API registration.
     */
    Optional<ApiEndpoint> findByApiRegistrationIdAndPathAndHttpMethod(UUID apiRegistrationId, 
                                                                      String path, 
                                                                      String httpMethod);
}

package com.mcphub.core.repository;

import com.mcphub.core.domain.DeploymentStatus;
import com.mcphub.core.domain.HealthStatus;
import com.mcphub.core.domain.McpServerDeployment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for McpServerDeployment entities.
 */
@Repository
public interface McpServerDeploymentRepository extends JpaRepository<McpServerDeployment, UUID> {

    /**
     * Find all deployments for a specific API registration.
     */
    List<McpServerDeployment> findByApiRegistrationId(UUID apiRegistrationId);

    /**
     * Find deployments by status.
     */
    List<McpServerDeployment> findByStatus(DeploymentStatus status);

    /**
     * Find deployments by health status.
     */
    List<McpServerDeployment> findByHealthStatus(HealthStatus healthStatus);

    /**
     * Find running deployments for an API registration.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.apiRegistration.id = :apiRegistrationId " +
           "AND d.status = 'RUNNING'")
    List<McpServerDeployment> findRunningDeploymentsByApiRegistrationId(@Param("apiRegistrationId") UUID apiRegistrationId);

    /**
     * Find deployment by container ID.
     */
    Optional<McpServerDeployment> findByContainerId(String containerId);

    /**
     * Find deployments by server name.
     */
    List<McpServerDeployment> findByServerName(String serverName);

    /**
     * Find deployments for a user (through API registration).
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.apiRegistration.userId = :userId")
    List<McpServerDeployment> findByUserId(@Param("userId") UUID userId);

    /**
     * Find deployments for a user with pagination.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.apiRegistration.userId = :userId")
    Page<McpServerDeployment> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find deployments that need health checks.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.status = 'RUNNING' " +
           "AND (d.lastHealthCheck IS NULL OR d.lastHealthCheck < :cutoffTime)")
    List<McpServerDeployment> findDeploymentsNeedingHealthCheck(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find unhealthy running deployments.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.status = 'RUNNING' " +
           "AND d.healthStatus IN ('UNHEALTHY', 'DEGRADED')")
    List<McpServerDeployment> findUnhealthyRunningDeployments();

    /**
     * Find deployments in transitional states.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.status IN ('PENDING', 'DEPLOYING', 'STOPPING', 'UPDATING', 'SCALING')")
    List<McpServerDeployment> findTransitionalDeployments();

    /**
     * Find deployments by endpoint URL.
     */
    Optional<McpServerDeployment> findByEndpointUrl(String endpointUrl);

    /**
     * Find deployments by host port.
     */
    List<McpServerDeployment> findByHostPort(Integer hostPort);

    /**
     * Count deployments by status.
     */
    long countByStatus(DeploymentStatus status);

    /**
     * Count running deployments for a user.
     */
    @Query("SELECT COUNT(d) FROM McpServerDeployment d WHERE d.apiRegistration.userId = :userId " +
           "AND d.status = 'RUNNING'")
    long countRunningDeploymentsByUserId(@Param("userId") UUID userId);

    /**
     * Count deployments for an API registration.
     */
    long countByApiRegistrationId(UUID apiRegistrationId);

    /**
     * Find deployments created within a date range.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.createdAt BETWEEN :startDate AND :endDate")
    List<McpServerDeployment> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Find deployments by version.
     */
    List<McpServerDeployment> findByVersion(String version);

    /**
     * Find latest deployment for an API registration.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.apiRegistration.id = :apiRegistrationId " +
           "ORDER BY d.createdAt DESC")
    List<McpServerDeployment> findLatestDeploymentsByApiRegistrationId(@Param("apiRegistrationId") UUID apiRegistrationId, 
                                                                       Pageable pageable);

    /**
     * Find deployments that have been running for a long time.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.status = 'RUNNING' " +
           "AND d.startedAt < :cutoffTime")
    List<McpServerDeployment> findLongRunningDeployments(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find failed deployments with error messages.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.status = 'FAILED' " +
           "AND d.errorMessage IS NOT NULL")
    List<McpServerDeployment> findFailedDeploymentsWithErrors();

    /**
     * Search deployments by server name.
     */
    @Query("SELECT d FROM McpServerDeployment d WHERE d.apiRegistration.userId = :userId " +
           "AND LOWER(d.serverName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<McpServerDeployment> searchByServerName(@Param("userId") UUID userId, 
                                                 @Param("searchTerm") String searchTerm, 
                                                 Pageable pageable);
}

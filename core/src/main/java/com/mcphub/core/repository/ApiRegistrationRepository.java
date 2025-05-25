package com.mcphub.core.repository;

import com.mcphub.core.domain.ApiRegistration;
import com.mcphub.core.domain.ApiType;
import com.mcphub.core.domain.RegistrationStatus;
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
 * Repository interface for ApiRegistration entities.
 */
@Repository
public interface ApiRegistrationRepository extends JpaRepository<ApiRegistration, UUID> {

    /**
     * Find all API registrations for a specific user.
     */
    List<ApiRegistration> findByUserId(UUID userId);

    /**
     * Find API registrations for a user with pagination.
     */
    Page<ApiRegistration> findByUserId(UUID userId, Pageable pageable);

    /**
     * Find API registrations by status.
     */
    List<ApiRegistration> findByStatus(RegistrationStatus status);

    /**
     * Find API registrations by user and status.
     */
    List<ApiRegistration> findByUserIdAndStatus(UUID userId, RegistrationStatus status);

    /**
     * Find API registrations by API type.
     */
    List<ApiRegistration> findByApiType(ApiType apiType);

    /**
     * Find API registrations by user and API type.
     */
    List<ApiRegistration> findByUserIdAndApiType(UUID userId, ApiType apiType);

    /**
     * Find API registration by name and user (names should be unique per user).
     */
    Optional<ApiRegistration> findByNameAndUserId(String name, UUID userId);

    /**
     * Check if an API registration with the given name exists for a user.
     */
    boolean existsByNameAndUserId(String name, UUID userId);

    /**
     * Find API registrations that need validation (pending or failed validation).
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.status IN ('PENDING', 'VALIDATION_FAILED') " +
           "AND (ar.lastValidatedAt IS NULL OR ar.lastValidatedAt < :cutoffTime)")
    List<ApiRegistration> findRegistrationsNeedingValidation(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find active API registrations for a user.
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.userId = :userId AND ar.status = 'ACTIVE'")
    List<ApiRegistration> findActiveRegistrationsByUserId(@Param("userId") UUID userId);

    /**
     * Find API registrations by base URL pattern.
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.baseUrl LIKE %:urlPattern%")
    List<ApiRegistration> findByBaseUrlContaining(@Param("urlPattern") String urlPattern);

    /**
     * Count API registrations by status.
     */
    long countByStatus(RegistrationStatus status);

    /**
     * Count API registrations by user.
     */
    long countByUserId(UUID userId);

    /**
     * Count active API registrations by user.
     */
    @Query("SELECT COUNT(ar) FROM ApiRegistration ar WHERE ar.userId = :userId AND ar.status = 'ACTIVE'")
    long countActiveRegistrationsByUserId(@Param("userId") UUID userId);

    /**
     * Find API registrations created within a date range.
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.createdAt BETWEEN :startDate AND :endDate")
    List<ApiRegistration> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);

    /**
     * Find API registrations that haven't been validated recently.
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.status = 'ACTIVE' " +
           "AND (ar.lastValidatedAt IS NULL OR ar.lastValidatedAt < :cutoffTime)")
    List<ApiRegistration> findStaleValidations(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Search API registrations by name or description.
     */
    @Query("SELECT ar FROM ApiRegistration ar WHERE ar.userId = :userId " +
           "AND (LOWER(ar.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ar.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<ApiRegistration> searchByNameOrDescription(@Param("userId") UUID userId, 
                                                    @Param("searchTerm") String searchTerm, 
                                                    Pageable pageable);
}

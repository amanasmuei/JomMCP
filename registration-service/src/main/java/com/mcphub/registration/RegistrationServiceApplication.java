package com.mcphub.registration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application class for the MCP Hub Registration Service.
 * 
 * This service is responsible for:
 * - API registration and validation
 * - Authentication configuration management
 * - OpenAPI/GraphQL schema parsing
 * - Credential encryption and secure storage
 * - API health monitoring
 */
@SpringBootApplication(scanBasePackages = {"com.mcphub.registration", "com.mcphub.core"})
@EntityScan(basePackages = {"com.mcphub.core.domain", "com.mcphub.registration.domain"})
@EnableJpaRepositories(basePackages = {"com.mcphub.core.repository", "com.mcphub.registration.repository"})
@EnableAsync
public class RegistrationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RegistrationServiceApplication.class, args);
    }
}

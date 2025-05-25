package com.mcphub.deployment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the MCP Hub Deployment Service.
 * 
 * This service is responsible for:
 * - Deploying MCP servers to container orchestration platforms
 * - Managing server lifecycle (start, stop, scale, update)
 * - Health monitoring and auto-recovery
 * - Resource management and optimization
 */
@SpringBootApplication(scanBasePackages = {"com.mcphub.deployment", "com.mcphub.core"})
@EntityScan(basePackages = {"com.mcphub.core.domain", "com.mcphub.deployment.domain"})
@EnableJpaRepositories(basePackages = {"com.mcphub.core.repository", "com.mcphub.deployment.repository"})
@EnableAsync
@EnableScheduling
public class DeploymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeploymentServiceApplication.class, args);
    }
}

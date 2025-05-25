package com.mcphub.generator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application class for the MCP Hub Generator Service.
 * 
 * This service is responsible for:
 * - Generating MCP server code from API specifications
 * - Building Docker images for generated servers
 * - Managing code templates and generation workflows
 */
@SpringBootApplication(scanBasePackages = {"com.mcphub.generator", "com.mcphub.core"})
@EntityScan(basePackages = {"com.mcphub.core.domain", "com.mcphub.generator.domain"})
@EnableJpaRepositories(basePackages = {"com.mcphub.core.repository", "com.mcphub.generator.repository"})
@EnableAsync
public class GeneratorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GeneratorServiceApplication.class, args);
    }
}

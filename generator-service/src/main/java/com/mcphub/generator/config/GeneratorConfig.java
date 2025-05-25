package com.mcphub.generator.config;

import freemarker.template.Configuration;
import freemarker.template.TemplateExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration class for the Generator Service.
 */
@org.springframework.context.annotation.Configuration
public class GeneratorConfig {

    @Value("${generator.template.path:classpath:/templates}")
    private String templatePath;

    @Value("${generator.async.core-pool-size:5}")
    private int corePoolSize;

    @Value("${generator.async.max-pool-size:20}")
    private int maxPoolSize;

    @Value("${generator.async.queue-capacity:100}")
    private int queueCapacity;

    /**
     * FreeMarker configuration for template processing.
     */
    @Bean
    @Primary
    public Configuration freemarkerConfiguration() {
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_32);
        
        // Set template loader based on path
        if (templatePath.startsWith("classpath:")) {
            cfg.setClassForTemplateLoading(this.getClass(), templatePath.substring(10));
        } else {
            try {
                cfg.setDirectoryForTemplateLoading(new java.io.File(templatePath));
            } catch (Exception e) {
                throw new RuntimeException("Failed to configure template directory: " + templatePath, e);
            }
        }
        
        // Configure FreeMarker settings
        cfg.setDefaultEncoding("UTF-8");
        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
        cfg.setLogTemplateExceptions(false);
        cfg.setWrapUncheckedExceptions(true);
        cfg.setFallbackOnNullLoopVariable(false);
        
        return cfg;
    }

    /**
     * Thread pool executor for async code generation tasks.
     */
    @Bean(name = "generatorTaskExecutor")
    public Executor generatorTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("Generator-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}

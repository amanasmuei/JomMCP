package com.mcphub.deployment.config;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientBuilder;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.Duration;
import java.util.concurrent.Executor;

/**
 * Configuration class for the Deployment Service.
 */
@Configuration
public class DeploymentConfig {

    @Value("${deployment.docker.host:unix:///var/run/docker.sock}")
    private String dockerHost;

    @Value("${deployment.async.core-pool-size:5}")
    private int corePoolSize;

    @Value("${deployment.async.max-pool-size:20}")
    private int maxPoolSize;

    @Value("${deployment.async.queue-capacity:100}")
    private int queueCapacity;

    /**
     * Docker client configuration for container management.
     */
    @Bean
    public DockerClient dockerClient() {
        DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost(dockerHost)
                .withDockerTlsVerify(false)
                .build();

        ApacheDockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .maxConnections(100)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(45))
                .build();

        return DockerClientBuilder.getInstance(config)
                .withDockerHttpClient(httpClient)
                .build();
    }

    /**
     * Kubernetes client configuration for orchestration.
     * Only enabled when Kubernetes is available.
     */
    @Bean
    @ConditionalOnProperty(name = "deployment.kubernetes.enabled", havingValue = "true")
    public KubernetesClient kubernetesClient() {
        return new KubernetesClientBuilder().build();
    }

    /**
     * Thread pool executor for async deployment tasks.
     */
    @Bean(name = "deploymentTaskExecutor")
    public Executor deploymentTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("Deployment-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}

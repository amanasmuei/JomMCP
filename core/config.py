"""
Configuration settings for the MCP Hub platform.
"""

import os
from typing import Any, Dict, List, Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
    """Database configuration settings."""
    
    url: str = Field(
        default="postgresql+asyncpg://mcphub:mcphub_dev_password@localhost:5432/mcphub",
        env="DATABASE_URL"
    )
    echo: bool = Field(default=False, env="DATABASE_ECHO")
    pool_size: int = Field(default=20, env="DATABASE_POOL_SIZE")
    max_overflow: int = Field(default=0, env="DATABASE_MAX_OVERFLOW")
    pool_pre_ping: bool = Field(default=True, env="DATABASE_POOL_PRE_PING")
    pool_recycle: int = Field(default=300, env="DATABASE_POOL_RECYCLE")


class RedisSettings(BaseSettings):
    """Redis configuration settings."""
    
    url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    host: str = Field(default="localhost", env="REDIS_HOST")
    port: int = Field(default=6379, env="REDIS_PORT")
    db: int = Field(default=0, env="REDIS_DB")
    password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    ssl: bool = Field(default=False, env="REDIS_SSL")
    max_connections: int = Field(default=20, env="REDIS_MAX_CONNECTIONS")


class SecuritySettings(BaseSettings):
    """Security configuration settings."""
    
    secret_key: str = Field(
        default="your-secret-key-here-change-in-production",
        env="SECRET_KEY"
    )
    encryption_key: str = Field(
        default="",  # Will be generated if not provided
        env="ENCRYPTION_KEY"
    )
    algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30, 
        env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(
        default=7, 
        env="REFRESH_TOKEN_EXPIRE_DAYS"
    )
    
    @validator("encryption_key", pre=True)
    def generate_encryption_key(cls, v):
        if not v:
            from cryptography.fernet import Fernet
            return Fernet.generate_key().decode()
        return v


class DockerSettings(BaseSettings):
    """Docker configuration settings."""
    
    registry_url: str = Field(default="localhost:5000", env="DOCKER_REGISTRY_URL")
    registry_username: Optional[str] = Field(default=None, env="DOCKER_REGISTRY_USERNAME")
    registry_password: Optional[str] = Field(default=None, env="DOCKER_REGISTRY_PASSWORD")
    namespace: str = Field(default="mcphub", env="DOCKER_REGISTRY_NAMESPACE")
    build_timeout_minutes: int = Field(default=10, env="DOCKER_BUILD_TIMEOUT_MINUTES")
    memory_limit: str = Field(default="2g", env="DOCKER_MEMORY_LIMIT")
    cpu_limit: str = Field(default="1", env="DOCKER_CPU_LIMIT")
    cleanup_after_build: bool = Field(default=True, env="DOCKER_CLEANUP_AFTER_BUILD")


class KubernetesSettings(BaseSettings):
    """Kubernetes configuration settings."""
    
    config_path: Optional[str] = Field(default=None, env="KUBECONFIG")
    namespace: str = Field(default="mcphub", env="KUBERNETES_NAMESPACE")
    in_cluster: bool = Field(default=False, env="KUBERNETES_IN_CLUSTER")
    service_account_path: Optional[str] = Field(
        default=None, 
        env="KUBERNETES_SERVICE_ACCOUNT_PATH"
    )


class GeneratorSettings(BaseSettings):
    """Code generator configuration settings."""
    
    template_path: str = Field(default="templates", env="TEMPLATE_PATH")
    output_directory: str = Field(default="/tmp/mcphub/generated", env="CODE_OUTPUT_DIR")
    cleanup_after_generation: bool = Field(
        default=False, 
        env="CLEANUP_AFTER_GENERATION"
    )
    max_concurrent_generations: int = Field(
        default=5, 
        env="MAX_CONCURRENT_GENERATIONS"
    )
    cache_enabled: bool = Field(default=True, env="TEMPLATE_CACHE_ENABLED")
    cache_ttl_minutes: int = Field(default=60, env="TEMPLATE_CACHE_TTL_MINUTES")


class MonitoringSettings(BaseSettings):
    """Monitoring configuration settings."""
    
    prometheus_enabled: bool = Field(default=True, env="PROMETHEUS_ENABLED")
    prometheus_port: int = Field(default=8000, env="PROMETHEUS_PORT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    structured_logging: bool = Field(default=True, env="STRUCTURED_LOGGING")


class Settings(BaseSettings):
    """Main application settings."""
    
    # Application info
    app_name: str = Field(default="MCP Hub Platform", env="APP_NAME")
    version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    # API configuration
    api_v1_prefix: str = Field(default="/api/v1", env="API_V1_PREFIX")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="CORS_ORIGINS"
    )
    
    # Rate limiting
    rate_limit_enabled: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    rate_limit_requests_per_minute: int = Field(
        default=100, 
        env="RATE_LIMIT_REQUESTS_PER_MINUTE"
    )
    rate_limit_burst_capacity: int = Field(
        default=200, 
        env="RATE_LIMIT_BURST_CAPACITY"
    )
    
    # Component settings
    database: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    security: SecuritySettings = SecuritySettings()
    docker: DockerSettings = DockerSettings()
    kubernetes: KubernetesSettings = KubernetesSettings()
    generator: GeneratorSettings = GeneratorSettings()
    monitoring: MonitoringSettings = MonitoringSettings()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()

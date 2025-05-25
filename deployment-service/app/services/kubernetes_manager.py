"""
Kubernetes cluster management service.
"""

import asyncio
from typing import Any, Dict, List, Optional

import structlog
from kubernetes import client, config
from kubernetes.client.rest import ApiException

from core.config import settings

logger = structlog.get_logger()


class KubernetesManager:
    """Manager for Kubernetes cluster operations."""
    
    def __init__(self):
        """Initialize Kubernetes manager."""
        self.apps_v1 = None
        self.core_v1 = None
        self.networking_v1 = None
        self.is_initialized = False
    
    async def initialize(self) -> None:
        """Initialize Kubernetes client."""
        try:
            if settings.kubernetes.in_cluster:
                # Load in-cluster config
                config.load_incluster_config()
                logger.info("Loaded in-cluster Kubernetes configuration")
            else:
                # Load config from file
                config_file = settings.kubernetes.config_path
                if config_file:
                    config.load_kube_config(config_file=config_file)
                else:
                    config.load_kube_config()
                logger.info("Loaded Kubernetes configuration from file")
            
            # Initialize API clients
            self.apps_v1 = client.AppsV1Api()
            self.core_v1 = client.CoreV1Api()
            self.networking_v1 = client.NetworkingV1Api()
            
            # Test connection
            await self._test_connection()
            self.is_initialized = True
            
            logger.info("Kubernetes manager initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize Kubernetes manager", error=str(e))
            # Don't raise exception - allow service to start without K8s
            self.is_initialized = False
    
    async def _test_connection(self) -> None:
        """Test Kubernetes connection."""
        try:
            # Try to list namespaces
            namespaces = self.core_v1.list_namespace(limit=1)
            logger.debug("Kubernetes connection test successful", namespace_count=len(namespaces.items))
        except Exception as e:
            logger.warning("Kubernetes connection test failed", error=str(e))
            raise
    
    async def cleanup(self) -> None:
        """Cleanup Kubernetes manager."""
        logger.info("Kubernetes manager cleanup completed")
    
    def is_available(self) -> bool:
        """Check if Kubernetes is available."""
        return self.is_initialized
    
    async def create_namespace(self, namespace: str) -> bool:
        """
        Create a Kubernetes namespace.
        
        Args:
            namespace: Namespace name
            
        Returns:
            bool: True if successful
        """
        if not self.is_available():
            logger.error("Kubernetes not available")
            return False
        
        try:
            # Check if namespace exists
            try:
                self.core_v1.read_namespace(name=namespace)
                logger.info("Namespace already exists", namespace=namespace)
                return True
            except ApiException as e:
                if e.status != 404:
                    raise
            
            # Create namespace
            namespace_manifest = client.V1Namespace(
                metadata=client.V1ObjectMeta(name=namespace)
            )
            
            self.core_v1.create_namespace(body=namespace_manifest)
            logger.info("Created namespace", namespace=namespace)
            return True
            
        except Exception as e:
            logger.error("Failed to create namespace", namespace=namespace, error=str(e))
            return False
    
    async def create_deployment(
        self,
        name: str,
        namespace: str,
        image: str,
        port: int,
        replicas: int = 1,
        cpu_limit: str = "500m",
        memory_limit: str = "512Mi",
        env_vars: Optional[Dict[str, str]] = None,
        labels: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Create a Kubernetes deployment.
        
        Args:
            name: Deployment name
            namespace: Namespace
            image: Container image
            port: Container port
            replicas: Number of replicas
            cpu_limit: CPU limit
            memory_limit: Memory limit
            env_vars: Environment variables
            labels: Labels
            
        Returns:
            bool: True if successful
        """
        if not self.is_available():
            logger.error("Kubernetes not available")
            return False
        
        try:
            # Ensure namespace exists
            await self.create_namespace(namespace)
            
            # Prepare labels
            deployment_labels = {
                "app": name,
                "managed-by": "mcp-hub",
                **(labels or {})
            }
            
            # Prepare environment variables
            env_list = []
            if env_vars:
                for key, value in env_vars.items():
                    env_list.append(client.V1EnvVar(name=key, value=value))
            
            # Create deployment manifest
            deployment = client.V1Deployment(
                api_version="apps/v1",
                kind="Deployment",
                metadata=client.V1ObjectMeta(
                    name=name,
                    namespace=namespace,
                    labels=deployment_labels
                ),
                spec=client.V1DeploymentSpec(
                    replicas=replicas,
                    selector=client.V1LabelSelector(
                        match_labels={"app": name}
                    ),
                    template=client.V1PodTemplateSpec(
                        metadata=client.V1ObjectMeta(
                            labels={"app": name}
                        ),
                        spec=client.V1PodSpec(
                            containers=[
                                client.V1Container(
                                    name=name,
                                    image=image,
                                    ports=[client.V1ContainerPort(container_port=port)],
                                    env=env_list,
                                    resources=client.V1ResourceRequirements(
                                        limits={
                                            "cpu": cpu_limit,
                                            "memory": memory_limit
                                        },
                                        requests={
                                            "cpu": "100m",
                                            "memory": "128Mi"
                                        }
                                    ),
                                    liveness_probe=client.V1Probe(
                                        http_get=client.V1HTTPGetAction(
                                            path="/health",
                                            port=port
                                        ),
                                        initial_delay_seconds=30,
                                        period_seconds=10
                                    ),
                                    readiness_probe=client.V1Probe(
                                        http_get=client.V1HTTPGetAction(
                                            path="/health",
                                            port=port
                                        ),
                                        initial_delay_seconds=5,
                                        period_seconds=5
                                    )
                                )
                            ]
                        )
                    )
                )
            )
            
            # Create deployment
            self.apps_v1.create_namespaced_deployment(
                namespace=namespace,
                body=deployment
            )
            
            logger.info("Created deployment", name=name, namespace=namespace)
            return True
            
        except Exception as e:
            logger.error("Failed to create deployment", name=name, error=str(e))
            return False
    
    async def create_service(
        self,
        name: str,
        namespace: str,
        port: int,
        target_port: int,
        service_type: str = "ClusterIP",
        labels: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Create a Kubernetes service.
        
        Args:
            name: Service name
            namespace: Namespace
            port: Service port
            target_port: Target port
            service_type: Service type
            labels: Labels
            
        Returns:
            bool: True if successful
        """
        if not self.is_available():
            logger.error("Kubernetes not available")
            return False
        
        try:
            # Prepare labels
            service_labels = {
                "app": name,
                "managed-by": "mcp-hub",
                **(labels or {})
            }
            
            # Create service manifest
            service = client.V1Service(
                api_version="v1",
                kind="Service",
                metadata=client.V1ObjectMeta(
                    name=f"{name}-service",
                    namespace=namespace,
                    labels=service_labels
                ),
                spec=client.V1ServiceSpec(
                    selector={"app": name},
                    ports=[
                        client.V1ServicePort(
                            port=port,
                            target_port=target_port,
                            protocol="TCP"
                        )
                    ],
                    type=service_type
                )
            )
            
            # Create service
            self.core_v1.create_namespaced_service(
                namespace=namespace,
                body=service
            )
            
            logger.info("Created service", name=f"{name}-service", namespace=namespace)
            return True
            
        except Exception as e:
            logger.error("Failed to create service", name=name, error=str(e))
            return False
    
    async def get_deployment_status(self, name: str, namespace: str) -> Optional[Dict[str, Any]]:
        """
        Get deployment status.
        
        Args:
            name: Deployment name
            namespace: Namespace
            
        Returns:
            Optional[Dict[str, Any]]: Deployment status
        """
        if not self.is_available():
            return None
        
        try:
            deployment = self.apps_v1.read_namespaced_deployment(
                name=name,
                namespace=namespace
            )
            
            return {
                "replicas": deployment.spec.replicas,
                "ready_replicas": deployment.status.ready_replicas or 0,
                "available_replicas": deployment.status.available_replicas or 0,
                "updated_replicas": deployment.status.updated_replicas or 0,
                "conditions": [
                    {
                        "type": condition.type,
                        "status": condition.status,
                        "reason": condition.reason,
                        "message": condition.message
                    }
                    for condition in (deployment.status.conditions or [])
                ]
            }
            
        except Exception as e:
            logger.error("Failed to get deployment status", name=name, error=str(e))
            return None
    
    async def get_pod_logs(self, name: str, namespace: str, lines: int = 100) -> str:
        """
        Get pod logs for a deployment.
        
        Args:
            name: Deployment name
            namespace: Namespace
            lines: Number of lines to retrieve
            
        Returns:
            str: Pod logs
        """
        if not self.is_available():
            return "Kubernetes not available"
        
        try:
            # Get pods for deployment
            pods = self.core_v1.list_namespaced_pod(
                namespace=namespace,
                label_selector=f"app={name}"
            )
            
            if not pods.items:
                return "No pods found for deployment"
            
            # Get logs from first pod
            pod_name = pods.items[0].metadata.name
            logs = self.core_v1.read_namespaced_pod_log(
                name=pod_name,
                namespace=namespace,
                tail_lines=lines
            )
            
            return logs
            
        except Exception as e:
            logger.error("Failed to get pod logs", name=name, error=str(e))
            return f"Error retrieving logs: {str(e)}"
    
    async def scale_deployment(self, name: str, namespace: str, replicas: int) -> bool:
        """
        Scale a deployment.
        
        Args:
            name: Deployment name
            namespace: Namespace
            replicas: Number of replicas
            
        Returns:
            bool: True if successful
        """
        if not self.is_available():
            return False
        
        try:
            # Update deployment replicas
            self.apps_v1.patch_namespaced_deployment_scale(
                name=name,
                namespace=namespace,
                body={"spec": {"replicas": replicas}}
            )
            
            logger.info("Scaled deployment", name=name, replicas=replicas)
            return True
            
        except Exception as e:
            logger.error("Failed to scale deployment", name=name, error=str(e))
            return False
    
    async def delete_deployment(self, name: str, namespace: str) -> bool:
        """
        Delete a deployment and its service.
        
        Args:
            name: Deployment name
            namespace: Namespace
            
        Returns:
            bool: True if successful
        """
        if not self.is_available():
            return False
        
        try:
            # Delete deployment
            try:
                self.apps_v1.delete_namespaced_deployment(
                    name=name,
                    namespace=namespace
                )
                logger.info("Deleted deployment", name=name)
            except ApiException as e:
                if e.status != 404:
                    raise
            
            # Delete service
            try:
                self.core_v1.delete_namespaced_service(
                    name=f"{name}-service",
                    namespace=namespace
                )
                logger.info("Deleted service", name=f"{name}-service")
            except ApiException as e:
                if e.status != 404:
                    raise
            
            return True
            
        except Exception as e:
            logger.error("Failed to delete deployment", name=name, error=str(e))
            return False

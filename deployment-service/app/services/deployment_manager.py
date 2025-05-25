"""
Deployment management service.
"""

import asyncio
from typing import Optional
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import AsyncSessionLocal
from core.models.deployment import Deployment, DeploymentStatus
from core.models.mcp_server import MCPServer

from .kubernetes_manager import KubernetesManager

logger = structlog.get_logger()


class DeploymentManager:
    """Manager for MCP server deployments."""
    
    def __init__(self, k8s_manager: KubernetesManager):
        """
        Initialize deployment manager.
        
        Args:
            k8s_manager: Kubernetes manager instance
        """
        self.k8s_manager = k8s_manager
    
    async def deploy_mcp_server(
        self,
        deployment_id: UUID,
        mcp_server: MCPServer
    ) -> None:
        """
        Deploy an MCP server to Kubernetes.
        
        Args:
            deployment_id: Deployment ID
            mcp_server: MCP server to deploy
        """
        async with AsyncSessionLocal() as db:
            try:
                # Get deployment record
                result = await db.execute(
                    select(Deployment).where(Deployment.id == deployment_id)
                )
                deployment = result.scalar_one_or_none()
                
                if not deployment:
                    logger.error("Deployment not found", deployment_id=deployment_id)
                    return
                
                logger.info(
                    "Starting MCP server deployment",
                    deployment_id=deployment_id,
                    mcp_server_id=mcp_server.id,
                    image=mcp_server.docker_image_name
                )
                
                # Update status to deploying
                deployment.status = DeploymentStatus.DEPLOYING
                await db.commit()
                
                # Generate deployment names
                deployment_name = f"mcp-{deployment.name}"
                deployment.deployment_name = deployment_name
                deployment.service_name = f"{deployment_name}-service"
                deployment.container_name = deployment_name
                
                # Prepare image name
                image_name = f"{mcp_server.docker_image_name}:{mcp_server.docker_image_tag}"
                
                # Create Kubernetes deployment
                success = await self.k8s_manager.create_deployment(
                    name=deployment_name,
                    namespace=deployment.namespace,
                    image=image_name,
                    port=deployment.port,
                    replicas=deployment.replicas,
                    cpu_limit=deployment.cpu_limit,
                    memory_limit=deployment.memory_limit,
                    env_vars=deployment.environment_variables,
                    labels={
                        "mcp-server-id": str(mcp_server.id),
                        "deployment-id": str(deployment.id),
                        "version": mcp_server.docker_image_tag or "latest"
                    }
                )
                
                if not success:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "Failed to create Kubernetes deployment"
                    await db.commit()
                    return
                
                # Create Kubernetes service
                service_success = await self.k8s_manager.create_service(
                    name=deployment_name,
                    namespace=deployment.namespace,
                    port=deployment.port,
                    target_port=deployment.port,
                    service_type="ClusterIP"
                )
                
                if not service_success:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "Failed to create Kubernetes service"
                    await db.commit()
                    return
                
                # Wait for deployment to be ready
                await self._wait_for_deployment_ready(deployment, db)
                
                logger.info(
                    "MCP server deployment completed successfully",
                    deployment_id=deployment_id,
                    deployment_name=deployment_name
                )
                
            except Exception as e:
                logger.error(
                    "Error during MCP server deployment",
                    deployment_id=deployment_id,
                    error=str(e)
                )
                
                # Update deployment with error
                try:
                    result = await db.execute(
                        select(Deployment).where(Deployment.id == deployment_id)
                    )
                    deployment = result.scalar_one_or_none()
                    if deployment:
                        deployment.status = DeploymentStatus.FAILED
                        deployment.error_message = str(e)
                        await db.commit()
                except Exception as db_error:
                    logger.error("Failed to update deployment error status", error=str(db_error))
    
    async def _wait_for_deployment_ready(
        self,
        deployment: Deployment,
        db: AsyncSession,
        timeout_seconds: int = 300
    ) -> None:
        """
        Wait for deployment to be ready.
        
        Args:
            deployment: Deployment record
            db: Database session
            timeout_seconds: Timeout in seconds
        """
        start_time = asyncio.get_event_loop().time()
        
        while True:
            # Check timeout
            if asyncio.get_event_loop().time() - start_time > timeout_seconds:
                deployment.status = DeploymentStatus.FAILED
                deployment.error_message = "Deployment timeout"
                await db.commit()
                return
            
            # Get deployment status from Kubernetes
            status = await self.k8s_manager.get_deployment_status(
                deployment.deployment_name,
                deployment.namespace
            )
            
            if status:
                ready_replicas = status.get("ready_replicas", 0)
                total_replicas = status.get("replicas", 0)
                
                if ready_replicas == total_replicas and ready_replicas > 0:
                    # Deployment is ready
                    deployment.status = DeploymentStatus.RUNNING
                    deployment.external_url = f"http://{deployment.service_name}.{deployment.namespace}.svc.cluster.local:{deployment.port}"
                    await db.commit()
                    return
                
                # Check for failure conditions
                conditions = status.get("conditions", [])
                for condition in conditions:
                    if condition.get("type") == "Progressing" and condition.get("status") == "False":
                        deployment.status = DeploymentStatus.FAILED
                        deployment.error_message = condition.get("message", "Deployment failed")
                        await db.commit()
                        return
            
            # Wait before next check
            await asyncio.sleep(10)
    
    async def update_deployment(self, deployment_id: UUID) -> None:
        """
        Update an existing deployment.
        
        Args:
            deployment_id: Deployment ID
        """
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(
                    select(Deployment).where(Deployment.id == deployment_id)
                )
                deployment = result.scalar_one_or_none()
                
                if not deployment:
                    logger.error("Deployment not found", deployment_id=deployment_id)
                    return
                
                logger.info("Updating deployment", deployment_id=deployment_id)
                
                # For now, we'll recreate the deployment
                # In a production system, you might want to use rolling updates
                
                # Delete existing deployment
                await self.k8s_manager.delete_deployment(
                    deployment.deployment_name,
                    deployment.namespace
                )
                
                # Wait a bit for cleanup
                await asyncio.sleep(5)
                
                # Get MCP server
                result = await db.execute(
                    select(MCPServer).where(MCPServer.id == deployment.mcp_server_id)
                )
                mcp_server = result.scalar_one_or_none()
                
                if not mcp_server:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "MCP server not found"
                    await db.commit()
                    return
                
                # Redeploy
                await self.deploy_mcp_server(deployment_id, mcp_server)
                
            except Exception as e:
                logger.error("Error updating deployment", deployment_id=deployment_id, error=str(e))
    
    async def scale_deployment(self, deployment_id: UUID, replicas: int) -> None:
        """
        Scale a deployment.
        
        Args:
            deployment_id: Deployment ID
            replicas: Number of replicas
        """
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(
                    select(Deployment).where(Deployment.id == deployment_id)
                )
                deployment = result.scalar_one_or_none()
                
                if not deployment:
                    logger.error("Deployment not found", deployment_id=deployment_id)
                    return
                
                logger.info("Scaling deployment", deployment_id=deployment_id, replicas=replicas)
                
                # Scale in Kubernetes
                success = await self.k8s_manager.scale_deployment(
                    deployment.deployment_name,
                    deployment.namespace,
                    replicas
                )
                
                if success:
                    deployment.status = DeploymentStatus.RUNNING
                    deployment.error_message = None
                else:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "Failed to scale deployment"
                
                await db.commit()
                
            except Exception as e:
                logger.error("Error scaling deployment", deployment_id=deployment_id, error=str(e))
    
    async def stop_deployment(self, deployment_id: UUID) -> None:
        """
        Stop a deployment.
        
        Args:
            deployment_id: Deployment ID
        """
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(
                    select(Deployment).where(Deployment.id == deployment_id)
                )
                deployment = result.scalar_one_or_none()
                
                if not deployment:
                    logger.error("Deployment not found", deployment_id=deployment_id)
                    return
                
                logger.info("Stopping deployment", deployment_id=deployment_id)
                
                # Scale to 0 replicas
                success = await self.k8s_manager.scale_deployment(
                    deployment.deployment_name,
                    deployment.namespace,
                    0
                )
                
                if success:
                    deployment.status = DeploymentStatus.STOPPED
                    deployment.replicas = 0
                    deployment.error_message = None
                else:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "Failed to stop deployment"
                
                await db.commit()
                
            except Exception as e:
                logger.error("Error stopping deployment", deployment_id=deployment_id, error=str(e))
    
    async def delete_deployment(self, deployment_id: UUID) -> None:
        """
        Delete a deployment.
        
        Args:
            deployment_id: Deployment ID
        """
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(
                    select(Deployment).where(Deployment.id == deployment_id)
                )
                deployment = result.scalar_one_or_none()
                
                if not deployment:
                    logger.error("Deployment not found", deployment_id=deployment_id)
                    return
                
                logger.info("Deleting deployment", deployment_id=deployment_id)
                
                # Delete from Kubernetes
                success = await self.k8s_manager.delete_deployment(
                    deployment.deployment_name,
                    deployment.namespace
                )
                
                if success:
                    # Delete from database
                    await db.delete(deployment)
                    await db.commit()
                    logger.info("Deployment deleted successfully", deployment_id=deployment_id)
                else:
                    deployment.status = DeploymentStatus.FAILED
                    deployment.error_message = "Failed to delete deployment from Kubernetes"
                    await db.commit()
                
            except Exception as e:
                logger.error("Error deleting deployment", deployment_id=deployment_id, error=str(e))
    
    async def get_deployment_logs(self, deployment: Deployment) -> str:
        """
        Get deployment logs.
        
        Args:
            deployment: Deployment record
            
        Returns:
            str: Deployment logs
        """
        if not deployment.deployment_name or not deployment.namespace:
            return "Deployment not yet created"
        
        return await self.k8s_manager.get_pod_logs(
            deployment.deployment_name,
            deployment.namespace
        )

#!/usr/bin/env python3
"""
Service startup script for MCP Hub Platform development.
Starts services in the correct order and verifies they're running.
"""

import asyncio
import subprocess
import time
import httpx
import sys
from pathlib import Path

# Service configurations
SERVICES = {
    "postgres": {"port": 5432, "health_url": None, "docker": True},
    "redis": {"port": 6379, "health_url": None, "docker": True},
    "registration": {
        "port": 8081,
        "health_url": "http://localhost:8081/api/v1/health",
        "docker": False,
    },
    "generator": {
        "port": 8082,
        "health_url": "http://localhost:8082/api/v1/health",
        "docker": False,
    },
    "deployment": {
        "port": 8083,
        "health_url": "http://localhost:8083/api/v1/health",
        "docker": False,
    },
    "docs": {
        "port": 8084,
        "health_url": "http://localhost:8084/api/v1/health",
        "docker": False,
    },
    "api-gateway": {
        "port": 8000,
        "health_url": "http://localhost:8000/health",
        "docker": False,
    },
}


async def check_service_health(service_name: str, config: dict) -> bool:
    """Check if a service is healthy."""
    if not config.get("health_url"):
        return True  # Skip health check for services without health endpoints

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(config["health_url"])
            return response.status_code == 200
    except Exception:
        return False


def start_docker_services():
    """Start PostgreSQL and Redis using docker-compose."""
    print("🐳 Starting Docker services (PostgreSQL, Redis)...")
    try:
        subprocess.run(
            ["docker-compose", "up", "-d", "postgres", "redis"],
            capture_output=True,
            text=True,
            check=True,
        )
        print("✅ Docker services started successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Docker services: {e}")
        print(f"Error output: {e.stderr}")
        return False


def start_python_service(service_name: str) -> subprocess.Popen:
    """Start a Python microservice."""
    service_dir = Path(f"{service_name}-service")
    if not service_dir.exists():
        service_dir = Path(service_name)  # For api-gateway

    if not service_dir.exists():
        print(f"❌ Service directory not found: {service_dir}")
        return None

    print(f"🚀 Starting {service_name} service...")

    # Try different startup methods
    startup_files = ["run.py", "main.py", "app/main.py"]

    for startup_file in startup_files:
        startup_path = service_dir / startup_file
        if startup_path.exists():
            try:
                process = subprocess.Popen(
                    [sys.executable, str(startup_path)],
                    cwd=str(service_dir),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                print(f"✅ Started {service_name} service (PID: {process.pid})")
                return process
            except Exception as e:
                print(f"❌ Failed to start {service_name} with {startup_file}: {e}")
                continue

    print(f"❌ Could not find startup file for {service_name}")
    return None


async def wait_for_service(service_name: str, config: dict, timeout: int = 30) -> bool:
    """Wait for a service to become healthy."""
    if not config.get("health_url"):
        time.sleep(2)  # Give non-health-checked services time to start
        return True

    print(f"⏳ Waiting for {service_name} to become healthy...")

    for i in range(timeout):
        if await check_service_health(service_name, config):
            print(f"✅ {service_name} is healthy")
            return True

        if i % 5 == 0:  # Print status every 5 seconds
            print(f"   Still waiting for {service_name}... ({i}/{timeout}s)")

        await asyncio.sleep(1)

    print(f"❌ {service_name} failed to become healthy within {timeout}s")
    return False


async def main():
    """Main startup sequence."""
    print("🚀 MCP Hub Platform - Service Startup")
    print("=" * 50)

    # Step 1: Start Docker services
    if not start_docker_services():
        print("❌ Failed to start Docker services. Exiting.")
        return False

    # Wait for Docker services to be ready
    print("⏳ Waiting for Docker services to be ready...")
    await asyncio.sleep(5)

    # Step 2: Start Python microservices in order
    processes = {}
    service_order = ["registration", "generator", "deployment", "docs", "api-gateway"]

    for service_name in service_order:
        config = SERVICES[service_name]

        # Start the service
        process = start_python_service(service_name)
        if process:
            processes[service_name] = process

            # Wait for it to become healthy
            if not await wait_for_service(service_name, config):
                print(f"❌ {service_name} failed to start properly")
                # Don't exit, continue with other services

            # Small delay between services
            await asyncio.sleep(2)
        else:
            print(f"❌ Failed to start {service_name}")

    # Step 3: Final health check
    print("\n🏥 Final Health Check")
    print("-" * 30)

    all_healthy = True
    for service_name, config in SERVICES.items():
        if config.get("health_url"):
            healthy = await check_service_health(service_name, config)
            status = "✅ Healthy" if healthy else "❌ Unhealthy"
            print(f"{service_name:12} {status}")
            if not healthy:
                all_healthy = False
        else:
            print(f"{service_name:12} ⏭️  Skipped")

    # Step 4: Summary
    print("\n" + "=" * 50)
    if all_healthy:
        print("🎉 All services started successfully!")
        print("\n📋 Service URLs:")
        print("   Frontend:     http://localhost:3000")
        print("   API Gateway:  http://localhost:8000")
        print("   API Docs:     http://localhost:8000/docs")
        print("   Registration: http://localhost:8081")
        print("   Generator:    http://localhost:8082")
        print("   Deployment:   http://localhost:8083")
        print("   Docs:         http://localhost:8084")

        print("\n🔧 Next Steps:")
        print("1. Start the frontend: cd web-ui && npm run dev")
        print("2. Run end-to-end tests: python3 test_end_to_end.py")
        print("3. Test WebSocket functionality")

        # Keep processes running
        print("\n⏳ Services are running. Press Ctrl+C to stop all services.")
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping all services...")
            for service_name, process in processes.items():
                print(f"   Stopping {service_name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
            print("✅ All services stopped")
    else:
        print("⚠️  Some services failed to start properly")
        print("Check the logs above for details")

        # Stop any running processes
        for service_name, process in processes.items():
            if process and process.poll() is None:
                print(f"🛑 Stopping {service_name}...")
                process.terminate()

    return all_healthy


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

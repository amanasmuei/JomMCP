#!/usr/bin/env python3
"""
Quick service status check for MCP Hub Platform.
"""

import asyncio
import httpx
import sys

SERVICES = {
    "API Gateway": "http://localhost:8000/health",
    "Registration": "http://localhost:8081/api/v1/health", 
    "Generator": "http://localhost:8082/api/v1/health",
    "Deployment": "http://localhost:8083/api/v1/health",
    "Docs": "http://localhost:8084/api/v1/health"
}

async def check_service(name: str, url: str) -> tuple[str, bool, str]:
    """Check if a service is responding."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                return name, True, "Healthy"
            else:
                return name, False, f"HTTP {response.status_code}"
    except httpx.ConnectError:
        return name, False, "Connection refused"
    except httpx.TimeoutException:
        return name, False, "Timeout"
    except Exception as e:
        return name, False, f"Error: {str(e)[:30]}..."

async def main():
    """Check all services."""
    print("🔍 Quick Service Status Check")
    print("=" * 40)
    
    tasks = [check_service(name, url) for name, url in SERVICES.items()]
    results = await asyncio.gather(*tasks)
    
    healthy_count = 0
    for name, is_healthy, status in results:
        icon = "✅" if is_healthy else "❌"
        print(f"{icon} {name:12} {status}")
        if is_healthy:
            healthy_count += 1
    
    print("=" * 40)
    print(f"📊 Status: {healthy_count}/{len(SERVICES)} services healthy")
    
    if healthy_count >= 2:  # Gateway + Registration minimum
        print("🎉 Core services operational!")
        return True
    else:
        print("⚠️  Core services need attention")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

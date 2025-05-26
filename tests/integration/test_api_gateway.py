#!/usr/bin/env python3
"""
Test script to verify API Gateway routing fixes.
"""

import asyncio
import httpx
import json
from typing import Dict, Any

# Test configuration
API_GATEWAY_URL = "http://localhost:8000"
TEST_ENDPOINTS = [
    "/health",
    "/api/v1/health/all",
    "/api/v1/auth/login",
    "/api/v1/registrations",
    "/api/v1/generation",
    "/api/v1/deployments",
    "/api/v1/docs",
]

async def test_endpoint(client: httpx.AsyncClient, endpoint: str) -> Dict[str, Any]:
    """Test a single endpoint."""
    try:
        response = await client.get(f"{API_GATEWAY_URL}{endpoint}", timeout=10.0)
        return {
            "endpoint": endpoint,
            "status_code": response.status_code,
            "success": True,
            "response_time_ms": response.elapsed.total_seconds() * 1000,
            "headers": dict(response.headers),
            "error": None
        }
    except httpx.ConnectError as e:
        return {
            "endpoint": endpoint,
            "status_code": None,
            "success": False,
            "response_time_ms": None,
            "headers": {},
            "error": f"Connection failed: {str(e)}"
        }
    except httpx.TimeoutException as e:
        return {
            "endpoint": endpoint,
            "status_code": None,
            "success": False,
            "response_time_ms": None,
            "headers": {},
            "error": f"Timeout: {str(e)}"
        }
    except Exception as e:
        return {
            "endpoint": endpoint,
            "status_code": None,
            "success": False,
            "response_time_ms": None,
            "headers": {},
            "error": f"Unexpected error: {str(e)}"
        }

async def test_redirect_handling():
    """Test redirect handling specifically."""
    print("\n=== Testing Redirect Handling ===")
    
    async with httpx.AsyncClient(follow_redirects=False) as client:
        # Test a potential redirect scenario
        try:
            response = await client.post(
                f"{API_GATEWAY_URL}/api/v1/auth/login",
                json={"username": "test", "password": "test"},
                timeout=10.0
            )
            print(f"Login endpoint status: {response.status_code}")
            if response.status_code in [301, 302, 307, 308]:
                print(f"Redirect detected: {response.headers.get('location')}")
            else:
                print("No redirect detected")
        except Exception as e:
            print(f"Error testing redirects: {e}")

async def test_cors_headers():
    """Test CORS headers."""
    print("\n=== Testing CORS Headers ===")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.options(
                f"{API_GATEWAY_URL}/api/v1/health",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "Authorization"
                },
                timeout=10.0
            )
            print(f"CORS preflight status: {response.status_code}")
            cors_headers = {
                k: v for k, v in response.headers.items() 
                if k.lower().startswith('access-control')
            }
            print(f"CORS headers: {json.dumps(cors_headers, indent=2)}")
        except Exception as e:
            print(f"Error testing CORS: {e}")

async def main():
    """Main test function."""
    print("🚀 Testing MCP Hub API Gateway Routing")
    print("=" * 50)
    
    # Test basic connectivity
    print("\n=== Testing Basic Connectivity ===")
    async with httpx.AsyncClient() as client:
        results = []
        for endpoint in TEST_ENDPOINTS:
            print(f"Testing {endpoint}...")
            result = await test_endpoint(client, endpoint)
            results.append(result)
            
            if result["success"]:
                print(f"  ✅ {result['status_code']} ({result['response_time_ms']:.1f}ms)")
            else:
                print(f"  ❌ {result['error']}")
    
    # Test redirect handling
    await test_redirect_handling()
    
    # Test CORS
    await test_cors_headers()
    
    # Summary
    print("\n=== Summary ===")
    successful_tests = sum(1 for r in results if r["success"])
    total_tests = len(results)
    print(f"Successful tests: {successful_tests}/{total_tests}")
    
    if successful_tests == 0:
        print("❌ API Gateway is not responding. Check if it's running on port 8000.")
    elif successful_tests < total_tests:
        print("⚠️  Some endpoints are not working. Check service availability.")
    else:
        print("✅ All basic connectivity tests passed!")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())

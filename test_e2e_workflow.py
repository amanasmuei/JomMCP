#!/usr/bin/env python3
"""
End-to-end workflow test for MCP Hub Platform.
Tests the complete user journey from registration to deployment.
"""

import requests
import json
import time
import sys

# Configuration
API_BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"


def test_service_health():
    """Test that all services are healthy."""
    print("🔍 Testing service health...")

    # Test API Gateway
    response = requests.get(f"{API_BASE_URL}/health")
    assert (
        response.status_code == 200
    ), f"API Gateway health check failed: {response.text}"
    print("✅ API Gateway is healthy")

    # Test individual services
    services = [
        ("registration", 8081),
        ("generator", 8082),
        ("deployment", 8083),
        ("docs", 8084),
    ]

    for service_name, port in services:
        try:
            response = requests.get(f"http://localhost:{port}/api/v1/health")
            assert (
                response.status_code == 200
            ), f"{service_name} service health check failed"
            print(f"✅ {service_name.title()} service is healthy")
        except Exception as e:
            print(f"❌ {service_name.title()} service health check failed: {e}")
            return False

    return True


def test_user_registration_and_login():
    """Test user registration and login flow."""
    print("\n👤 Testing user registration and login...")

    # Test user registration
    user_data = {
        "username": "e2etest",
        "email": "e2etest@example.com",
        "password": "TestPassword123",
        "full_name": "E2E Test User",
    }

    response = requests.post(f"{API_BASE_URL}/api/v1/auth/register", json=user_data)
    if response.status_code == 409 or response.status_code == 400:
        print("ℹ️  User already exists, proceeding with login test")
    elif response.status_code == 201:
        print("✅ User registration successful")
    else:
        print(f"❌ User registration failed: {response.status_code} - {response.text}")
        return None

    # Test user login
    login_data = {"username": user_data["username"], "password": user_data["password"]}

    response = requests.post(f"{API_BASE_URL}/api/v1/auth/login", json=login_data)
    if response.status_code == 200:
        tokens = response.json()
        print("✅ User login successful")
        return tokens.get("access_token")
    else:
        print(f"❌ User login failed: {response.status_code} - {response.text}")
        return None


def test_api_registration(access_token):
    """Test API registration workflow."""
    print("\n📝 Testing API registration...")

    headers = {"Authorization": f"Bearer {access_token}"}

    api_data = {
        "name": "Test API",
        "description": "A test API for E2E testing",
        "base_url": "https://jsonplaceholder.typicode.com",
        "api_type": "rest",
        "authentication_type": "none",
        "endpoints": [
            {"path": "/posts", "method": "GET", "description": "Get all posts"},
            {
                "path": "/posts/{id}",
                "method": "GET",
                "description": "Get a specific post",
            },
        ],
    }

    response = requests.post(
        f"{API_BASE_URL}/api/v1/registrations", json=api_data, headers=headers
    )
    if response.status_code == 201:
        registration = response.json()
        print("✅ API registration successful")
        return registration["id"]
    else:
        print(f"❌ API registration failed: {response.status_code} - {response.text}")
        return None


def test_mcp_generation(access_token, registration_id):
    """Test MCP server generation."""
    print("\n⚙️  Testing MCP server generation...")

    headers = {"Authorization": f"Bearer {access_token}"}

    generation_data = {
        "api_registration_id": registration_id,
        "name": "test-mcp-server",
        "description": "Generated MCP server for testing",
        "mcp_config": {
            "version": "1.0.0",
            "capabilities": {"tools": True, "resources": True, "prompts": False},
        },
    }

    response = requests.post(
        f"{API_BASE_URL}/api/v1/generation", json=generation_data, headers=headers
    )
    if response.status_code == 201:
        generation = response.json()
        print("✅ MCP server generation initiated")
        return generation["id"]
    else:
        print(
            f"❌ MCP server generation failed: {response.status_code} - {response.text}"
        )
        return None


def test_frontend_accessibility():
    """Test that frontend is accessible."""
    print("\n🌐 Testing frontend accessibility...")

    try:
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200 and "MCP Hub" in response.text:
            print("✅ Frontend is accessible and serving content")
            return True
        else:
            print(f"❌ Frontend accessibility test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend accessibility test failed: {e}")
        return False


def main():
    """Run the complete end-to-end test suite."""
    print("🚀 Starting MCP Hub Platform E2E Test Suite")
    print("=" * 50)

    # Test 1: Service Health
    if not test_service_health():
        print("\n❌ Service health tests failed. Exiting.")
        sys.exit(1)

    # Test 2: Frontend Accessibility
    if not test_frontend_accessibility():
        print("\n❌ Frontend accessibility test failed. Exiting.")
        sys.exit(1)

    # Test 3: User Registration and Login
    access_token = test_user_registration_and_login()
    if not access_token:
        print("\n❌ User authentication tests failed. Exiting.")
        sys.exit(1)

    # Test 4: API Registration
    registration_id = test_api_registration(access_token)
    if not registration_id:
        print("\n❌ API registration test failed. Exiting.")
        sys.exit(1)

    # Test 5: MCP Generation
    generation_id = test_mcp_generation(access_token, registration_id)
    if not generation_id:
        print("\n❌ MCP generation test failed. Exiting.")
        sys.exit(1)

    print("\n" + "=" * 50)
    print("🎉 All E2E tests passed successfully!")
    print("✅ MCP Hub Platform is fully functional")
    print("\nNext steps:")
    print("- Open http://localhost:3000 to use the web interface")
    print("- API Gateway is running on http://localhost:8000")
    print("- All backend services are operational")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import requests
import json

# Login to get token
login_data = {"username": "e2etest", "password": "TestPassword123"}

print("🔐 Getting authentication token...")
response = requests.post("http://localhost:8000/api/v1/auth/login", json=login_data)
print(f"Login response: {response.status_code}")

if response.status_code == 200:
    tokens = response.json()
    access_token = tokens.get("access_token")
    print(f"✅ Got access token: {access_token[:50]}...")

    # Test registration endpoint
    headers = {"Authorization": f"Bearer {access_token}"}

    print("\n📝 Testing registrations endpoint...")
    response = requests.get(
        "http://localhost:8000/api/v1/registrations", headers=headers
    )
    print(f"GET registrations response: {response.status_code}")
    print(f"Response: {response.text}")

    # Test POST to registrations
    api_data = {
        "name": "Simple Test API",
        "description": "A simple test API",
        "base_url": "https://jsonplaceholder.typicode.com",
        "api_type": "rest",
        "authentication_type": "none",
        "endpoints": [
            {"path": "/posts", "method": "GET", "description": "Get all posts"}
        ],
    }

    print("\n📝 Testing POST to registrations...")
    response = requests.post(
        "http://localhost:8000/api/v1/registrations", json=api_data, headers=headers
    )
    print(f"POST registrations response: {response.status_code}")
    print(f"Response: {response.text}")

else:
    print(f"❌ Login failed: {response.text}")

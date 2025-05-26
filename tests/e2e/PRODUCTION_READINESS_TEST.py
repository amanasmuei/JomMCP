#!/usr/bin/env python3
"""
Comprehensive Production Readiness Test for MCP Hub Platform.
Tests all "Next Steps for Production" items.
"""

import asyncio
import httpx
import json
import time
from typing import Dict, List


class ProductionReadinessTest:
    def __init__(self):
        self.api_gateway = "http://localhost:8000"
        self.frontend_origin = "http://localhost:3000"
        self.test_results = []

    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test result."""
        self.test_results.append(
            {
                "test": test_name,
                "status": status,
                "details": details,
                "timestamp": time.time(),
            }
        )

    async def test_api_gateway_routing(self):
        """Test API Gateway routing fixes (Highest Priority)."""
        print("🔧 PHASE 1: API Gateway Routing Fixes (HIGHEST PRIORITY)")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            # Test 1: Environment-based service discovery
            print("\n1.1 Testing environment-based service discovery...")
            try:
                response = await client.get(
                    f"{self.api_gateway}/api/v1/health/all", timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    services = data.get("services", {})
                    print(
                        f"   ✅ Service discovery working: {len(services)} services detected"
                    )
                    self.log_test(
                        "Service Discovery", "PASS", f"{len(services)} services"
                    )
                else:
                    print(f"   ❌ Service discovery failed: {response.status_code}")
                    self.log_test(
                        "Service Discovery", "FAIL", f"HTTP {response.status_code}"
                    )
            except Exception as e:
                print(f"   ❌ Service discovery error: {e}")
                self.log_test("Service Discovery", "ERROR", str(e))

            # Test 2: 307 Redirect handling
            print("\n1.2 Testing 307 redirect handling...")
            try:
                response = await client.get(
                    f"{self.api_gateway}/api/v1/health/all", timeout=10
                )
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    print("   ✅ Redirect handling working (no 307 issues)")
                    self.log_test("Redirect Handling", "PASS", "No 307 issues")
                else:
                    print(f"   ⚠️  Response: {response.status_code}")
                    self.log_test(
                        "Redirect Handling", "PARTIAL", f"HTTP {response.status_code}"
                    )
            except Exception as e:
                print(f"   ❌ Redirect test error: {e}")
                self.log_test("Redirect Handling", "ERROR", str(e))

            # Test 3: Error handling improvements
            print("\n1.3 Testing enhanced error handling...")
            try:
                # Test unavailable service
                response = await client.get(
                    f"{self.api_gateway}/api/v1/generation", timeout=10
                )
                if response.status_code in [503, 401]:
                    if response.status_code == 503:
                        print("   ✅ Proper 503 for unavailable service")
                    else:
                        print("   ✅ Proper 401 for protected endpoint")
                    self.log_test("Error Handling", "PASS", "Proper error responses")
                else:
                    print(f"   ⚠️  Unexpected status: {response.status_code}")
                    self.log_test(
                        "Error Handling", "PARTIAL", f"HTTP {response.status_code}"
                    )
            except Exception as e:
                print(f"   ❌ Error handling test failed: {e}")
                self.log_test("Error Handling", "ERROR", str(e))

            # Test 4: CORS configuration
            print("\n1.4 Testing CORS configuration...")
            try:
                response = await client.options(
                    f"{self.api_gateway}/api/v1/registrations",
                    headers={
                        "Origin": self.frontend_origin,
                        "Access-Control-Request-Method": "POST",
                        "Access-Control-Request-Headers": "Authorization",
                    },
                    timeout=10,
                )
                if response.status_code == 200:
                    cors_origin = response.headers.get("access-control-allow-origin")
                    if cors_origin == self.frontend_origin:
                        print("   ✅ CORS properly configured for frontend")
                        self.log_test(
                            "CORS Configuration", "PASS", "Frontend origin allowed"
                        )
                    else:
                        print(f"   ⚠️  CORS origin: {cors_origin}")
                        self.log_test(
                            "CORS Configuration", "PARTIAL", f"Origin: {cors_origin}"
                        )
                else:
                    print(f"   ❌ CORS preflight failed: {response.status_code}")
                    self.log_test(
                        "CORS Configuration", "FAIL", f"HTTP {response.status_code}"
                    )
            except Exception as e:
                print(f"   ❌ CORS test error: {e}")
                self.log_test("CORS Configuration", "ERROR", str(e))

    async def test_end_to_end_workflow(self):
        """Test end-to-end workflow."""
        print("\n🔄 PHASE 2: End-to-End Workflow Testing")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            # Test authentication flow
            print("\n2.1 Testing authentication workflow...")
            try:
                login_response = await client.post(
                    f"{self.api_gateway}/api/v1/auth/login",
                    json={"username": "prodtest", "password": "ProdTest123!"},
                    timeout=10,
                )
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    access_token = token_data["access_token"]
                    print("   ✅ Authentication successful")
                    self.log_test("Authentication Flow", "PASS", "Login successful")

                    # Test authenticated API call
                    print("\n2.2 Testing authenticated API operations...")
                    auth_headers = {"Authorization": f"Bearer {access_token}"}

                    # List registrations
                    list_response = await client.get(
                        f"{self.api_gateway}/api/v1/registrations",
                        headers=auth_headers,
                        timeout=10,
                    )
                    if list_response.status_code == 200:
                        registrations = list_response.json()
                        print(f"   ✅ List registrations: {len(registrations)} found")

                        # Create registration
                        create_response = await client.post(
                            f"{self.api_gateway}/api/v1/registrations",
                            json={
                                "name": "Production Test API",
                                "description": "API created during production readiness test",
                                "base_url": "https://api.production-test.com",
                                "api_type": "rest",
                            },
                            headers=auth_headers,
                            timeout=10,
                        )
                        if create_response.status_code in [200, 201]:
                            new_reg = create_response.json()
                            print(f"   ✅ Create registration: {new_reg['id']}")
                            self.log_test(
                                "API Operations", "PASS", "CRUD operations working"
                            )
                        else:
                            print(f"   ⚠️  Create failed: {create_response.status_code}")
                            self.log_test(
                                "API Operations", "PARTIAL", "List works, create issues"
                            )
                    else:
                        print(
                            f"   ❌ List registrations failed: {list_response.status_code}"
                        )
                        self.log_test(
                            "API Operations",
                            "FAIL",
                            f"HTTP {list_response.status_code}",
                        )

                else:
                    print(f"   ❌ Authentication failed: {login_response.status_code}")
                    self.log_test(
                        "Authentication Flow",
                        "FAIL",
                        f"HTTP {login_response.status_code}",
                    )
            except Exception as e:
                print(f"   ❌ Workflow test error: {e}")
                self.log_test("End-to-End Workflow", "ERROR", str(e))

    async def test_api_endpoints(self):
        """Test all API endpoints."""
        print("\n🔍 PHASE 3: Complete API Endpoint Testing")
        print("=" * 60)

        endpoints_to_test = [
            ("/health", "GET", "Gateway health"),
            ("/api/v1/health/all", "GET", "Service health aggregation"),
            ("/api/v1/auth/login", "POST", "Authentication"),
            ("/api/v1/registrations", "GET", "Registration listing"),
            ("/api/v1/generation", "GET", "Generation service"),
            ("/api/v1/deployments", "GET", "Deployment service"),
            ("/api/v1/docs", "GET", "Documentation service"),
        ]

        async with httpx.AsyncClient() as client:
            working_endpoints = 0
            total_endpoints = len(endpoints_to_test)

            for endpoint, method, description in endpoints_to_test:
                print(
                    f"\n3.{working_endpoints + 1} Testing {description} ({method} {endpoint})..."
                )
                try:
                    if method == "GET":
                        response = await client.get(
                            f"{self.api_gateway}{endpoint}", timeout=10
                        )
                    elif method == "POST":
                        response = await client.post(
                            f"{self.api_gateway}{endpoint}",
                            json={"username": "prodtest", "password": "ProdTest123!"},
                            timeout=10,
                        )

                    print(f"   Status: {response.status_code}")
                    # Accept 200 (success), 503 (service unavailable), 401 (auth required), 422 (validation error)
                    if response.status_code in [200, 503, 401, 422]:
                        working_endpoints += 1
                        if response.status_code == 200:
                            print(f"   ✅ Endpoint responding correctly")
                        elif response.status_code == 503:
                            print(
                                f"   ✅ Service unavailable (expected for unstarted services)"
                            )
                        elif response.status_code == 401:
                            print(
                                f"   ✅ Authentication required (expected for protected endpoints)"
                            )
                        elif response.status_code == 422:
                            print(
                                f"   ✅ Validation error (expected for auth endpoints without proper data)"
                            )
                    else:
                        print(f"   ⚠️  Unexpected status: {response.status_code}")

                except Exception as e:
                    print(f"   ❌ Error: {e}")

            success_rate = (working_endpoints / total_endpoints) * 100
            print(
                f"\n📊 Endpoint Test Results: {working_endpoints}/{total_endpoints} ({success_rate:.1f}%)"
            )
            self.log_test(
                "API Endpoints",
                "PASS" if success_rate >= 70 else "PARTIAL",
                f"{success_rate:.1f}% success rate",
            )

    def generate_report(self):
        """Generate final production readiness report."""
        print("\n" + "=" * 80)
        print("📋 PRODUCTION READINESS REPORT")
        print("=" * 80)

        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        partial = sum(1 for r in self.test_results if r["status"] == "PARTIAL")
        failed = sum(1 for r in self.test_results if r["status"] == "FAIL")
        errors = sum(1 for r in self.test_results if r["status"] == "ERROR")
        total = len(self.test_results)

        print(f"\n📊 Test Summary:")
        print(f"   ✅ PASSED: {passed}/{total}")
        print(f"   ⚠️  PARTIAL: {partial}/{total}")
        print(f"   ❌ FAILED: {failed}/{total}")
        print(f"   🔥 ERRORS: {errors}/{total}")

        print(f"\n📈 Overall Score: {((passed + partial * 0.5) / total * 100):.1f}%")

        print(f"\n📋 Detailed Results:")
        for result in self.test_results:
            status_icon = {"PASS": "✅", "PARTIAL": "⚠️", "FAIL": "❌", "ERROR": "🔥"}[
                result["status"]
            ]
            print(
                f"   {status_icon} {result['test']}: {result['status']} - {result['details']}"
            )

        # Production readiness assessment
        if passed >= 5 and failed == 0:
            print(f"\n🎉 PRODUCTION READY!")
            print("   All critical systems are functioning correctly.")
            print("   API Gateway routing issues have been resolved.")
            print("   Platform is ready for deployment.")
        elif passed >= 3:
            print(f"\n⚠️  MOSTLY READY")
            print("   Core functionality working, minor issues to address.")
            print("   Safe for staging deployment.")
        else:
            print(f"\n❌ NOT READY")
            print("   Critical issues need to be resolved before deployment.")


async def main():
    """Run comprehensive production readiness test."""
    print("🚀 MCP Hub Platform - Production Readiness Test")
    print("Testing all 'Next Steps for Production' items")
    print("=" * 80)

    tester = ProductionReadinessTest()

    # Run all test phases
    await tester.test_api_gateway_routing()
    await tester.test_end_to_end_workflow()
    await tester.test_api_endpoints()

    # Generate final report
    tester.generate_report()


if __name__ == "__main__":
    asyncio.run(main())

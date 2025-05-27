#!/usr/bin/env python3
"""
Check password verification for existing users.
"""

import asyncio
import sys
import os

# Add project paths
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "packages"))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.models.user import User
from core.security import verify_password


async def check_user_password():
    """Check password verification for testuser."""
    print("🔍 Checking password verification...")
    
    try:
        async for db in get_db():
            # Get testuser
            result = await db.execute(select(User).where(User.username == "testuser"))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ User 'testuser' not found")
                return
            
            print(f"✅ Found user: {user.username} ({user.email})")
            print(f"   Active: {user.is_active}")
            print(f"   Verified: {user.is_verified}")
            
            # Test different passwords
            test_passwords = [
                "TestPass123",
                "testpass123", 
                "testpass",
                "password123",
                "Password123"
            ]
            
            print("\n🔐 Testing passwords:")
            for password in test_passwords:
                is_valid = verify_password(password, user.hashed_password)
                status = "✅" if is_valid else "❌"
                print(f"   {status} '{password}': {is_valid}")
                
                if is_valid:
                    print(f"\n🎉 Correct password found: '{password}'")
                    break
            else:
                print("\n❌ None of the test passwords worked")
                print("   The user might have been created with a different password")
            
            break
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(check_user_password())

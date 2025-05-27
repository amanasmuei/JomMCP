#!/usr/bin/env python3
"""
Quick test script to verify the setup and create a test user.
"""

import asyncio
import sys
import os

# Add project paths
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "packages"))

from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db, create_tables
from core.models.user import User, UserRole
from core.security import get_password_hash


async def test_setup():
    """Test the database setup and create a test user."""
    print("🔧 Testing JomMCP Platform Setup...")
    
    try:
        # Test database connection and create tables
        print("📊 Creating database tables...")
        await create_tables()
        print("✅ Database tables created successfully")
        
        # Test user creation
        print("👤 Creating test user...")
        async for db in get_db():
            # Check if user already exists
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.username == "testuser"))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("ℹ️  Test user already exists")
                print(f"   Username: {existing_user.username}")
                print(f"   Email: {existing_user.email}")
                print(f"   Active: {existing_user.is_active}")
            else:
                # Create new test user
                hashed_password = get_password_hash("TestPass123")
                test_user = User(
                    username="testuser",
                    email="test@example.com",
                    full_name="Test User",
                    hashed_password=hashed_password,
                    role=UserRole.USER,
                    is_active=True,
                    is_verified=True,
                )
                
                db.add(test_user)
                await db.commit()
                await db.refresh(test_user)
                
                print("✅ Test user created successfully")
                print(f"   Username: {test_user.username}")
                print(f"   Email: {test_user.email}")
                print(f"   ID: {test_user.id}")
            
            break
        
        print("\n🎉 Setup test completed successfully!")
        print("\n📝 You can now test login with:")
        print("   Username: testuser")
        print("   Password: TestPass123")
        
    except Exception as e:
        print(f"❌ Setup test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_setup())

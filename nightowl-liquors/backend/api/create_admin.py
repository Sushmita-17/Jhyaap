#!/usr/bin/env python
"""
Script to create an admin user for the Jhyaap Station API.
Usage: python create_admin.py
"""

import os
import sys
import uuid
from datetime import datetime, timezone
from getpass import getpass
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models import User
from app.security import hash_password
from app.config import get_settings

settings = get_settings()


def create_admin_user(phone: str, email: str, password: str):
    """Create a new admin user"""
    engine = create_engine(str(settings.database_url))

    with Session(engine) as db:
        # Check if user already exists
        existing = db.query(User).filter(User.phone == phone).first()
        if existing:
            print(f"❌ User with phone {phone} already exists")
            return False

        # Create new admin user
        admin_user = User(
            id=uuid.uuid4(),
            phone=phone,
            email=email,
            role='admin',
            is_staff=True,
            is_active=True,
            password=hash_password(password),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"✅ Admin user created successfully!")
        print(f"   Phone: {phone}")
        print(f"   Email: {email}")
        print(f"   User ID: {admin_user.id}")

        return True


def main():
    """Main entry point"""
    print("🔐 Jhyaap Station Admin User Creation")
    print("-" * 50)

    phone = input("Enter admin phone number (10 digits): ").strip()
    if not phone or len(phone) != 10 or not phone.isdigit():
        print("❌ Invalid phone number. Must be 10 digits.")
        return

    if not phone.startswith('9'):
        print("❌ Phone number must start with 9 for Nepal.")
        return

    email = input("Enter admin email: ").strip()
    if not email or '@' not in email:
        print("❌ Invalid email address.")
        return

    password = getpass("Enter admin password: ")
    password_confirm = getpass("Confirm password: ")

    if password != password_confirm:
        print("❌ Passwords do not match.")
        return

    if len(password) < 8:
        print("❌ Password must be at least 8 characters.")
        return

    if create_admin_user(phone, email, password):
        print("\n✨ You can now login to the admin panel!")
    else:
        print("\n❌ Failed to create admin user.")


if __name__ == '__main__':
    main()

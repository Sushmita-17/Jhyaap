"""
Create admin user in Supabase PostgreSQL
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import uuid
import bcrypt
from app.db.supabase_client import get_supabase_client

def create_admin_user():
    """Create default admin user in Supabase"""
    supabase = get_supabase_client()
    
    # Check if admin users exist
    result = supabase.table("admin_users").select("*").execute()
    
    if result.data:
        print(f'Admin users table already has {len(result.data)} user(s)')
        for admin in result.data:
            print(f'  - {admin.get("email")} ({admin.get("name")})')
        return
    
    # Create default admin user
    admin_id = 'admin_001'
    admin_email = 'admin@jhyaap.com'
    admin_password = 'admin123'  # Default password - CHANGE IN PRODUCTION
    password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_admin = {
        "id": admin_id,
        "email": admin_email,
        "password_hash": password_hash,
        "name": "Admin User",
        "is_active": True
    }
    
    result = supabase.table("admin_users").insert(new_admin).execute()
    
    print(f'Created default admin user:')
    print(f'  Email: {admin_email}')
    print(f'  Password: {admin_password}')
    print(f'  IMPORTANT: Change this password in production!')

if __name__ == "__main__":
    create_admin_user()

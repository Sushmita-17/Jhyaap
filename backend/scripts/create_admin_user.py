"""
Create default admin user for the admin panel
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import sqlite3
from app.core.security import get_password_hash

DB_DIR = Path(__file__).parent.parent / 'data'
DB_PATH = DB_DIR / 'jhyaap.db'
DB_DIR.mkdir(parents=True, exist_ok=True)

def create_admin_user():
    """Create default admin user"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Check if admin users exist
    cursor.execute('SELECT COUNT(*) FROM admin_users')
    count = cursor.fetchone()[0]
    
    if count > 0:
        print(f'Admin users table already has {count} user(s)')
        cursor.execute('SELECT email, name FROM admin_users')
        admins = cursor.fetchall()
        for admin in admins:
            print(f'  - {admin[0]} ({admin[1]})')
        conn.close()
        return
    
    # Create default admin user
    admin_id = 'admin_001'
    admin_email = 'admin@jhyaap.com'
    admin_password = 'admin123'  # Default password - CHANGE IN PRODUCTION
    password_hash = get_password_hash(admin_password)
    
    cursor.execute('''
    INSERT INTO admin_users (id, email, password_hash, name, is_active)
    VALUES (?, ?, ?, ?, ?)
    ''', (admin_id, admin_email, password_hash, 'Admin User', True))
    
    conn.commit()
    conn.close()
    
    print(f'Created default admin user:')
    print(f'  Email: {admin_email}')
    print(f'  Password: {admin_password}')
    print(f'  IMPORTANT: Change this password in production!')

if __name__ == "__main__":
    create_admin_user()

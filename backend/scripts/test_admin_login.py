"""
Test admin login credentials
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import sqlite3
from app.core.security import verify_password, get_password_hash

DB_PATH = Path(__file__).parent.parent / 'data' / 'jhyaap.db'

def test_admin_login():
    """Test admin login with current credentials"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Get admin user
    cursor.execute('SELECT * FROM admin_users WHERE email = ?', ('admin@jhyaap.com',))
    admin = cursor.fetchone()
    
    if not admin:
        print('No admin user found')
        return
    
    admin_id, email, password_hash, name, is_active, created_at, updated_at = admin
    print(f'Admin user found:')
    print(f'  Email: {email}')
    print(f'  Name: {name}')
    print(f'  Active: {is_active}')
    print(f'  Password hash: {password_hash[:50]}...')
    
    # Test password verification
    test_password = 'admin123'
    is_valid = verify_password(test_password, password_hash)
    print(f'\nTesting password "{test_password}": {"VALID" if is_valid else "INVALID"}')
    
    if not is_valid:
        print('Creating new password hash...')
        new_hash = get_password_hash(test_password)
        print(f'New hash: {new_hash[:50]}...')
        
        # Update database
        cursor.execute('UPDATE admin_users SET password_hash = ? WHERE email = ?', (new_hash, email))
        conn.commit()
        print('Password updated in database')
    
    conn.close()

if __name__ == "__main__":
    test_admin_login()

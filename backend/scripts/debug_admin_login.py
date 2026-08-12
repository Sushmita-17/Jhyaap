import sqlite3
import bcrypt

DB_PATH = 'backend/data/jhyaap.db'

def debug_admin_login():
    """Debug admin login by checking database and password verification"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get admin user
    cursor.execute('SELECT * FROM admin_users WHERE email = ?', ('admin@jhyaap.com',))
    row = cursor.fetchone()
    columns = [column[0] for column in cursor.description]
    admin = dict(zip(columns, row))
    
    print("Admin user from database:")
    print(f"  Email: {admin['email']}")
    print(f"  Name: {admin['name']}")
    print(f"  Is Active: {admin['is_active']}")
    print(f"  Password Hash: {admin['password_hash']}")
    
    # Test password verification
    password = 'admin123'
    stored_hash = admin['password_hash']
    
    print(f"\nTesting password: {password}")
    print(f"Against hash: {stored_hash}")
    
    try:
        result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"Verification result: {result}")
    except Exception as e:
        print(f"Verification error: {e}")
    
    conn.close()

if __name__ == "__main__":
    debug_admin_login()

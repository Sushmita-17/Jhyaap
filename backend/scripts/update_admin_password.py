import sqlite3
import bcrypt

DB_PATH = 'backend/data/jhyaap.db'

def update_admin_password():
    """Update admin password to admin123"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Generate new password hash
    password = 'admin123'
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f"New password hash: {password_hash}")
    
    # Update admin password
    cursor.execute('UPDATE admin_users SET password_hash = ? WHERE email = ?', 
                   (password_hash, 'admin@jhyaap.com'))
    conn.commit()
    
    # Verify update
    cursor.execute('SELECT email, password_hash FROM admin_users WHERE email = ?', ('admin@jhyaap.com',))
    result = cursor.fetchone()
    print(f"Updated admin: {result}")
    
    conn.close()
    print("Password updated successfully")

if __name__ == "__main__":
    update_admin_password()

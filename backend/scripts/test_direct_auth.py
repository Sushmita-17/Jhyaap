import sqlite3
import bcrypt

# Direct test of the auth logic
DB_PATH = 'backend/data/jhyaap.db'

def fetch_admin_by_email(email: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM admin_users WHERE lower(email) = lower(?)", (email.strip(),))
        row = cursor.fetchone()
        if not row:
            return None
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()
        conn.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Verification error: {e}")
        return False

def test_login():
    email = 'admin@jhyaap.com'
    password = 'admin123'
    
    print(f"Testing login for: {email}")
    print(f"Password: {password}")
    
    admin = fetch_admin_by_email(email)
    print(f"\nAdmin found: {admin is not None}")
    
    if admin:
        print(f"Admin email: {admin.get('email')}")
        print(f"Admin is_active: {admin.get('is_active')}")
        print(f"Password hash: {admin.get('password_hash')}")
        
        if not admin.get("is_active", True):
            print("Admin is inactive")
            return False
        
        print(f"\nVerifying password...")
        if verify_password(password, admin.get("password_hash") or ""):
            print("Password verified successfully")
            return True
        else:
            print("Password verification failed")
            return False
    else:
        print("Admin not found")
        return False

if __name__ == "__main__":
    test_login()

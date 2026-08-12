import sys
sys.path.insert(0, 'backend')

from app.db.database import get_connection, is_postgres

def test_fetch_admin():
    """Test the fetch_admin_by_email function"""
    email = 'admin@jhyaap.com'
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        placeholder = "%s" if is_postgres(conn) else "?"
        cursor.execute(f"SELECT * FROM admin_users WHERE lower(email) = lower({placeholder})", (email.strip(),))
        row = cursor.fetchone()
        if not row:
            print("Admin not found")
            return None
        if isinstance(row, dict):
            admin = dict(row)
        else:
            columns = [column[0] for column in cursor.description]
            admin = dict(zip(columns, row))
        
        print("Admin fetched successfully:")
        print(f"  Email: {admin.get('email')}")
        print(f"  Password Hash: {admin.get('password_hash')}")
        print(f"  Is Active: {admin.get('is_active')}")
        return admin
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    test_fetch_admin()

import sqlite3
import bcrypt
from pathlib import Path

DB_PATH = r'c:\Users\LENOVO\Downloads\Jhyaap_Station\Jhyaap_Station\backend\data\jhyaap.db'

def hash_password(password):
    """Hash password using bcrypt like the backend"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_test_rider():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create a test rider with known credentials
    phone_number = "9801234567"
    password = "password123"
    name = "Test Rider"
    vehicle_type = "Bike"
    status = "active"
    
    # Hash the password using bcrypt
    password_hash = hash_password(password)
    
    # Check if rider already exists
    cursor.execute("SELECT * FROM rider_credentials WHERE phone_number = ?", (phone_number,))
    existing = cursor.fetchone()
    
    if existing:
        print(f"Rider with phone {phone_number} already exists. Updating password...")
        cursor.execute(
            "UPDATE rider_credentials SET password_hash = ? WHERE phone_number = ?",
            (password_hash, phone_number)
        )
    else:
        print(f"Creating new rider with phone {phone_number}...")
        import uuid
        rider_id = str(uuid.uuid4())
        cursor.execute(
            """INSERT INTO rider_credentials 
               (id, phone_number, password_hash, name, vehicle_type, status, total_earnings, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))""",
            (rider_id, phone_number, password_hash, name, vehicle_type, status, 0.0)
        )
    
    conn.commit()
    conn.close()
    
    print(f"✅ Rider credentials created/updated:")
    print(f"   Phone: {phone_number}")
    print(f"   Password: {password}")
    print(f"   Name: {name}")

if __name__ == "__main__":
    create_test_rider()

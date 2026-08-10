from app.db.database import get_connection
from app.core.config import settings

print(f"DATABASE_URL from settings: {settings.DATABASE_URL}")
print(f"Database URL starts with postgres: {settings.DATABASE_URL.startswith('postgresql://') if settings.DATABASE_URL else 'No URL set'}")

# Test connection
conn = get_connection()
print(f"Connection type: {type(conn).__name__}")
print(f"Connection database: {conn}")

# Try to query the rider_credentials table
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rider_credentials'")
table_exists = cursor.fetchone()
print(f"rider_credentials table exists: {table_exists is not None}")

if table_exists:
    cursor.execute("SELECT COUNT(*) FROM rider_credentials")
    count = cursor.fetchone()
    print(f"Total riders: {count[0]}")
    
    cursor.execute("SELECT * FROM rider_credentials WHERE phone_number = ?", ("9811223344",))
    rider = cursor.fetchone()
    print(f"Rider with phone 9811223344: {rider}")

cursor.close()
conn.close()

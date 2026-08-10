from app.db.database import get_connection, is_postgres
from app.core.config import settings

print(f"DATABASE_URL from settings: {settings.DATABASE_URL[:30]}...")
print(f"Database URL starts with postgres: {settings.DATABASE_URL.startswith('postgresql://') if settings.DATABASE_URL else 'No URL set'}")

# Test connection
conn = get_connection()
print(f"Connection type: {type(conn).__name__}")
print(f"Is PostgreSQL: {is_postgres(conn)}")

# Try to query the rider_credentials table
cursor = conn.cursor()

if is_postgres(conn):
    # PostgreSQL query
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'rider_credentials'
    """)
else:
    # SQLite query
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rider_credentials'")

table_exists = cursor.fetchone()
print(f"rider_credentials table exists: {table_exists is not None}")

if table_exists:
    cursor.execute("SELECT COUNT(*) FROM rider_credentials")
    count = cursor.fetchone()
    print(f"Total riders: {count[0]}")
    
    cursor.execute("SELECT * FROM rider_credentials WHERE phone_number = %s" if is_postgres(conn) else "SELECT * FROM rider_credentials WHERE phone_number = ?", 
                   ("9811223344",))
    rider = cursor.fetchone()
    print(f"Rider with phone 9811223344: {rider}")
else:
    print("❌ rider_credentials table does not exist in Supabase")
    print("You need to create the tables in Supabase using the SQL from SUPABASE_CONNECTION_GUIDE.md")

cursor.close()
conn.close()

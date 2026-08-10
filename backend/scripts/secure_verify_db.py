import os
import sys
from urllib.parse import urlparse

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import get_connection, is_postgres
from app.core.config import settings

def mask_url(url: str) -> str:
    if not url:
        return "Not Set (Fallback to SQLite)"
    try:
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        parsed = urlparse(url)
        netloc = ""
        if parsed.username:
            netloc += "******"
        if parsed.password:
            netloc += ":******@"
        netloc += parsed.hostname or "unknown"
        if parsed.port:
            netloc += f":{parsed.port}"
        return f"{parsed.scheme}://{netloc}{parsed.path}"
    except Exception:
        return "Set but unable to parse safely"

def verify_connection():
    print("=" * 60)
    print("      SUPABASE SECURE CONNECTION VERIFICATION TOOL      ")
    print("=" * 60)
    
    # 1. Check loaded config variables (WITHOUT printing raw values)
    db_url_masked = mask_url(settings.DATABASE_URL)
    print(f"DATABASE_URL (Masked): {db_url_masked}")
    
    supabase_url_exists = bool(settings.SUPABASE_URL)
    supabase_anon_exists = bool(settings.SUPABASE_ANON_KEY)
    supabase_service_exists = bool(settings.SUPABASE_SERVICE_ROLE_KEY)
    
    print(f"SUPABASE_URL set: {supabase_url_exists}")
    print(f"SUPABASE_ANON_KEY set: {supabase_anon_exists}")
    print(f"SUPABASE_SERVICE_ROLE_KEY set: {supabase_service_exists}")
    
    # 2. Attempt Database Connection
    print("\nAttempting connection to the database...")
    try:
        conn = get_connection()
        conn_type = type(conn).__name__
        is_pg = is_postgres(conn)
        print(f"[SUCCESS] Connection Established!")
        print(f"Connection Type: {conn_type}")
        print(f"Is PostgreSQL (Supabase): {is_pg}")
        
        # 3. Check for required tables
        cursor = conn.cursor()
        
        required_tables = [
            "products",
            "rider_credentials",
            "customers",
            "orders",
            "rider_earnings"
        ]
        
        print("\nChecking database tables:")
        for table in required_tables:
            if is_pg:
                cursor.execute(
                    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = %s);",
                    (table,)
                )
                exists = cursor.fetchone()
                # psycopg2 extra row dict or tuple handling
                if isinstance(exists, dict):
                    table_exists = exists.get("exists", False)
                else:
                    table_exists = exists[0] if exists else False
            else:
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?;",
                    (table,)
                )
                table_exists = cursor.fetchone() is not None
                
            status = "[EXISTS]" if table_exists else "[MISSING]"
            
            # If table exists, show row count
            row_count = 0
            if table_exists:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    cnt = cursor.fetchone()
                    if isinstance(cnt, dict):
                        row_count = list(cnt.values())[0]
                    else:
                        row_count = cnt[0] if cnt else 0
                    print(f"  - {table:<20} : {status} (Rows: {row_count})")
                except Exception as table_err:
                    print(f"  - {table:<20} : {status} (Error reading count: {table_err})")
            else:
                print(f"  - {table:<20} : {status}")
                
        cursor.close()
        conn.close()
        
        print("\nSummary Check:")
        if is_pg:
            print("Successfully connected to PostgreSQL/Supabase database!")
        else:
            print("Using SQLite fallback. Please check DATABASE_URL in backend/.env if you wanted Supabase.")
            
    except Exception as e:
        print(f"\n[ERROR] Connection Failed!")
        print(f"Error details: {e}")

if __name__ == "__main__":
    verify_connection()

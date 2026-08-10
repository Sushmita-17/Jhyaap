"""
Test Supabase connection and provide troubleshooting guidance.
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings
from app.db.supabase_client import get_supabase_client


def test_supabase_connection():
    """Test Supabase client connection."""
    print("Testing Supabase connection...")
    print(f"SUPABASE_URL: {settings.SUPABASE_URL}")
    print(f"SUPABASE_ANON_KEY: {'✓ Set' if settings.SUPABASE_ANON_KEY else '✗ Not set'}")
    print(f"SUPABASE_SERVICE_ROLE_KEY: {'✓ Set' if settings.SUPABASE_SERVICE_ROLE_KEY else '✗ Not set'}")
    print(f"DATABASE_URL: {'✓ Set' if settings.DATABASE_URL else '✗ Not set'}")
    print()
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("✗ Supabase credentials not configured properly.")
        print("\nPlease add these to your .env file:")
        print("SUPABASE_URL=https://your-project.supabase.co")
        print("SUPABASE_ANON_KEY=your_anon_key")
        print("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
        return False
    
    try:
        # Test Supabase client connection
        supabase = get_supabase_client()
        
        # Try a simple query
        result = supabase.table('customers').select('count', count='exact').execute()
        print(f"✓ Supabase client connection successful!")
        print(f"✓ Can query customers table (count: {result.count})")
        
        # Test database connection
        if settings.DATABASE_URL:
            import psycopg2
            conn = psycopg2.connect(settings.DATABASE_URL, connect_timeout=10)
            conn.close()
            print(f"✓ Direct PostgreSQL connection successful!")
        else:
            print("⚠ DATABASE_URL not set - using Supabase client only")
        
        return True
        
    except Exception as e:
        print(f"✗ Supabase connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your Supabase project is active")
        print("2. Verify your API keys are correct")
        print("3. Check your network connection")
        print("4. For PostgreSQL timeout issues, try:")
        print("   - Getting the connection string from Supabase Dashboard → Settings → Database")
        print("   - Format: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres")
        return False


if __name__ == "__main__":
    success = test_supabase_connection()
    sys.exit(0 if success else 1)

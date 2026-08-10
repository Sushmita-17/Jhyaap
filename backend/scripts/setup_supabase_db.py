"""
Setup Supabase PostgreSQL connection for Jhyaap Station.
This script helps configure the DATABASE_URL and tests the connection.
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings


def setup_supabase_db():
    """Guide user through Supabase PostgreSQL setup."""
    print("=== Supabase PostgreSQL Connection Setup ===\n")
    
    print("Step 1: Get your Database Connection String")
    print("-" * 50)
    print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard")
    print("2. Select your project: jbibgtqxjckuaidmodvo")
    print("3. Navigate to: Settings → Database")
    print("4. Find 'Connection String' section")
    print("5. Select 'URI' format")
    print("6. Copy the connection string")
    print("7. It should look like:")
    print("   postgresql://postgres:[YOUR-PASSWORD]@db.jbibgtqxjckuaidmodvo.supabase.co:5432/postgres")
    print()
    
    print("Step 2: Add to your .env file")
    print("-" * 50)
    print("Add this line to your backend/.env file:")
    print("DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jbibgtqxjckuaidmodvo.supabase.co:5432/postgres")
    print()
    
    print("Step 3: Current Configuration Status")
    print("-" * 50)
    print(f"SUPABASE_URL: {'✓ Set' if settings.SUPABASE_URL else '✗ Not set'}")
    print(f"SUPABASE_ANON_KEY: {'✓ Set' if settings.SUPABASE_ANON_KEY else '✗ Not set'}")
    print(f"SUPABASE_SERVICE_ROLE_KEY: {'✓ Set' if settings.SUPABASE_SERVICE_ROLE_KEY else '✗ Not set'}")
    print(f"DATABASE_URL: {'✓ Set' if settings.DATABASE_URL else '✗ Not set'}")
    print()
    
    if settings.DATABASE_URL:
        print("Step 4: Testing PostgreSQL Connection")
        print("-" * 50)
        try:
            import psycopg2
            print(f"Attempting to connect to: {settings.DATABASE_URL[:30]}...")
            
            # Test connection with increased timeout
            conn = psycopg2.connect(
                settings.DATABASE_URL,
                connect_timeout=30,
                options="-c statement_timeout=30000"
            )
            print("✓ PostgreSQL connection successful!")
            
            # Test a simple query
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✓ Database version: {version[0][:50]}...")
            
            cursor.close()
            conn.close()
            
            print("\n✓ Your Supabase PostgreSQL connection is working!")
            print("You can now restart your backend server.")
            return True
            
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            print("\nTroubleshooting:")
            print("1. Verify your connection string is correct")
            print("2. Check your Supabase project is active (not paused)")
            print("3. Ensure your database password is correct")
            print("4. Check your internet connection")
            print("5. Try accessing Supabase dashboard to confirm project is accessible")
            return False
    else:
        print("⚠ DATABASE_URL not set in .env file")
        print("Please complete Step 2 to add the connection string.")
        return False


if __name__ == "__main__":
    success = setup_supabase_db()
    sys.exit(0 if success else 1)

"""
Check the actual structure of the customers table in Supabase
"""
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.supabase_client import get_supabase_client


def check_customers_table():
    """Check the structure of the customers table"""
    print("Checking customers table structure...")
    
    try:
        supabase = get_supabase_client()
        
        # Try to get one customer to see the structure
        result = supabase.table('customers').select('*').limit(1).execute()
        
        if result.data:
            print("✓ Customers table exists")
            print("Sample customer structure:")
            sample = result.data[0]
            for key, value in sample.items():
                print(f"  {key}: {type(value).__name__} = {value}")
        else:
            print("✓ Customers table exists but is empty")
            print("Cannot determine structure from empty table")
            
        # Try to get table info via RPC (if available)
        print("\nAttempting to get table information...")
        
    except Exception as e:
        print(f"✗ Error checking customers table: {e}")
        return False
        
    return True


if __name__ == "__main__":
    success = check_customers_table()
    sys.exit(0 if success else 1)

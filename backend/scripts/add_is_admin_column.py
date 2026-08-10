"""
Migration script to add is_admin column to rider_credentials table.
Run this script to update existing databases with the new security feature.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import get_connection, is_postgres

def add_is_admin_column():
    """Add is_admin column to rider_credentials table if it doesn't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        if is_postgres(conn):
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'rider_credentials' AND column_name = 'is_admin'
            """)
        else:
            cursor.execute("PRAGMA table_info(rider_credentials)")
            columns = [col[1] for col in cursor.fetchall()]
            column_exists = 'is_admin' in columns
            
            if column_exists:
                print("is_admin column already exists in rider_credentials table")
                return
        
        # Add the column
        if is_postgres(conn):
            cursor.execute("""
                ALTER TABLE rider_credentials 
                ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
            """)
        else:
            cursor.execute("""
                ALTER TABLE rider_credentials 
                ADD COLUMN is_admin INTEGER DEFAULT 0
            """)
        
        conn.commit()
        print("Successfully added is_admin column to rider_credentials table")
        
        # Create first admin user (optional - you can set this manually)
        print("\nTo make a rider an admin, you can run:")
        print("UPDATE rider_credentials SET is_admin = 1 WHERE phone_number = '+977XXXXXXXXXX';")
        
    except Exception as e:
        conn.rollback()
        print(f"Error adding is_admin column: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_is_admin_column()
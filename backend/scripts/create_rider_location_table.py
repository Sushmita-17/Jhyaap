import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import get_connection, is_postgres

def create_rider_location_table():
    """Create rider_location table for GPS tracking"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rider_location (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                    rider_id TEXT NOT NULL,
                    latitude DECIMAL(10, 7) NOT NULL,
                    longitude DECIMAL(10, 7) NOT NULL,
                    heading DECIMAL(5, 2),
                    speed DECIMAL(5, 2),
                    accuracy DECIMAL(5, 2),
                    battery_level INTEGER,
                    created_at TIMESTAMPTZ DEFAULT now(),
                    
                    CONSTRAINT fk_rider FOREIGN KEY (rider_id) REFERENCES rider_credentials(id) ON DELETE CASCADE
                )
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rider_location_rider_id ON rider_location(rider_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rider_location_created_at ON rider_location(created_at DESC)
            """)
            
            conn.commit()
            print("Created rider_location table successfully")
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rider_location (
                    id TEXT PRIMARY KEY,
                    rider_id TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    heading REAL,
                    speed REAL,
                    accuracy REAL,
                    battery_level INTEGER,
                    created_at TEXT DEFAULT (datetime('now')),
                    
                    FOREIGN KEY (rider_id) REFERENCES rider_credentials(id) ON DELETE CASCADE
                )
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rider_location_rider_id ON rider_location(rider_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_rider_location_created_at ON rider_location(created_at DESC)
            """)
            
            conn.commit()
            print("Created rider_location table successfully (SQLite)")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_rider_location_table()

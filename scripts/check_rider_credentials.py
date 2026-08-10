import sqlite3

db_path = r'c:\Users\LENOVO\Downloads\Jhyaap_Station\Jhyaap_Station\backend\data\jhyaap.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check for rider-related tables
    rider_tables = [t[0] for t in tables if 'rider' in t[0].lower()]
    if rider_tables:
        print(f"\nRider-related tables: {rider_tables}")
        
        for table_name in rider_tables:
            print(f"\n--- {table_name} ---")
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            print("Columns:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            print(f"Sample data ({len(rows)} rows):")
            for row in rows:
                print(f"  {row}")
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")

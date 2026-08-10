import sqlite3
from pathlib import Path

DB_PATH = Path("data/jhyaap.db")

def check_rider():
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Check if rider_credentials table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rider_credentials'")
    table_exists = cursor.fetchone()
    
    if not table_exists:
        print("rider_credentials table does not exist")
        return
    
    # Check all riders
    cursor.execute("SELECT * FROM rider_credentials")
    riders = cursor.fetchall()
    
    print(f"Total riders in database: {len(riders)}")
    
    for rider in riders:
        print(f"Rider: {rider}")
    
    # Check specific rider
    cursor.execute("SELECT * FROM rider_credentials WHERE phone_number = ?", ("9811223344",))
    specific_rider = cursor.fetchone()
    
    if specific_rider:
        print(f"Found rider with phone 9811223344: {specific_rider}")
    else:
        print("No rider found with phone 9811223344")
    
    conn.close()

if __name__ == "__main__":
    check_rider()

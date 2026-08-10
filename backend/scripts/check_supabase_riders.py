from app.db.database import get_connection, is_postgres

conn = get_connection()
cursor = conn.cursor()

if is_postgres(conn):
    # Get all riders from Supabase
    cursor.execute("SELECT * FROM rider_credentials")
    riders = cursor.fetchall()
    
    print(f"Total riders in Supabase: {len(riders)}")
    
    for rider in riders:
        print(f"Rider: {rider}")
else:
    print("Not connected to Supabase")

cursor.close()
conn.close()

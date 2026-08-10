from app.db.database import get_connection, is_postgres

conn = get_connection()
cursor = conn.cursor()

if is_postgres(conn):
    # Update the phone number in Supabase to remove country code
    cursor.execute("UPDATE rider_credentials SET phone_number = '9811223344' WHERE phone_number = '+9779811223344'")
    conn.commit()
    
    # Verify the update
    cursor.execute("SELECT * FROM rider_credentials WHERE phone_number = '9811223344'")
    rider = cursor.fetchone()
    
    if rider:
        print("✅ Phone number updated successfully in Supabase")
        print(f"Rider: {rider}")
    else:
        print("❌ Failed to update phone number")
else:
    print("Not connected to Supabase")

cursor.close()
conn.close()

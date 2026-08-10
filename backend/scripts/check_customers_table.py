from app.db.database import get_connection, is_postgres

conn = get_connection()
cursor = conn.cursor()

if is_postgres(conn):
    # Get columns from customers table
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    """)
else:
    # Get columns from customers table (SQLite)
    cursor.execute("PRAGMA table_info(customers)")

columns = cursor.fetchall()
print("Customers table columns:")
for col in columns:
    print(f"  {col}")

cursor.close()
conn.close()

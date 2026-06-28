import psycopg2
from psycopg2 import OperationalError

try:
    # Connect to PostgreSQL default database (postgres)
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='postgres',
        host='localhost',
        port='5432'
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Create the database
    cursor.execute("CREATE DATABASE nightowl_db;")
    print("Database 'nightowl_db' created successfully!")
    
    cursor.close()
    conn.close()
except OperationalError as e:
    print(f"Error: {e}")
    print("Database might already exist or connection failed.")

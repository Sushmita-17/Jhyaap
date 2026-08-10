import sys
sys.path.append('.')
from app.db.database import get_connection, is_postgres

def fast_fix_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            query = """
                UPDATE products 
                SET image = 'https://cheers.com.np/uploads' || image 
                WHERE image LIKE '/products/%'
            """
        else:
            query = """
                UPDATE products 
                SET image = 'https://cheers.com.np/uploads' || image 
                WHERE image LIKE '/products/%'
            """
            
        cursor.execute(query)
        conn.commit()
        print(f"Successfully updated {cursor.rowcount} rows in the database instantly via SQL.")
    except Exception as e:
        print(f"Error executing bulk update: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    fast_fix_db()

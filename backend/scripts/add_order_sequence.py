import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import get_connection, is_postgres

def add_order_sequence():
    """Add order_number column and sequence to orders table"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Check if order_number column exists
        placeholder = "%s" if is_postgres(conn) else "?"
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'order_number'
        """)
        column_exists = cursor.fetchone()
        
        if column_exists:
            print("order_number column already exists, populating existing orders...")
            # Populate existing orders with sequential numbers
            if is_postgres(conn):
                # Create sequence if it doesn't exist
                cursor.execute("""
                    CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100
                """)
                # Update existing orders with sequential numbers
                cursor.execute("""
                    UPDATE orders SET order_number = nextval('order_number_seq') WHERE order_number IS NULL
                """)
            else:
                # Get max existing order number
                cursor.execute("SELECT MAX(order_number) FROM orders")
                max_num = cursor.fetchone()[0] or 99
                # Update existing orders
                cursor.execute("SELECT id FROM orders ORDER BY created_at")
                rows = cursor.fetchall()
                for i, row in enumerate(rows):
                    order_id = row[0]
                    cursor.execute("UPDATE orders SET order_number = ? WHERE id = ?", (max_num + i + 1, order_id))
            
            conn.commit()
            print("Populated order_number for existing orders")
        else:
            # Add order_number column
            if is_postgres(conn):
                cursor.execute("""
                    ALTER TABLE orders ADD COLUMN order_number INTEGER
                """)
                # Create sequence
                cursor.execute("""
                    CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100
                """)
                # Set default value
                cursor.execute("""
                    ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq')
                """)
                # Update existing orders with sequential numbers
                cursor.execute("""
                    UPDATE orders SET order_number = nextval('order_number_seq') WHERE order_number IS NULL
                """)
            else:
                cursor.execute("""
                    ALTER TABLE orders ADD COLUMN order_number INTEGER
                """)
                # Get max existing order number
                cursor.execute("SELECT MAX(order_number) FROM orders")
                max_num = cursor.fetchone()[0] or 99
                # Update existing orders
                cursor.execute("SELECT id FROM orders ORDER BY created_at")
                rows = cursor.fetchall()
                for i, row in enumerate(rows):
                    order_id = row[0]
                    cursor.execute("UPDATE orders SET order_number = ? WHERE id = ?", (max_num + i + 1, order_id))
            
            conn.commit()
            print("Added order_number column and sequence")
        
        # Verify
        cursor.execute("SELECT id, order_number FROM orders ORDER BY order_number")
        orders = cursor.fetchall()
        print("\nOrders with order numbers:")
        for order in orders:
            print(f"  ID: {order[0]}, Order Number: {order[1]}")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_order_sequence()

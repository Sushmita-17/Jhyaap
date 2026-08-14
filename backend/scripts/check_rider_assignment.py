import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import get_connection, is_postgres

def check_rider_assignment():
    """Check if Raj Thapa has any assigned orders"""
    raj_thapa_id = '507595d3-c370-47c1-84f2-44449d33d40d'
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check all orders with riders
    placeholder = "%s" if is_postgres(conn) else "?"
    cursor.execute(f"SELECT id, customer_id, rider_id, status FROM orders WHERE rider_id IS NOT NULL", [])
    rows = cursor.fetchall()
    
    print('Orders with riders:')
    for row in rows:
        if isinstance(row, dict):
            print(f"  ID: {row['id']}, Rider: {row['rider_id']}, Status: {row['status']}")
        else:
            columns = [column[0] for column in cursor.description]
            order = dict(zip(columns, row))
            print(f"  ID: {order['id']}, Rider: {order['rider_id']}, Status: {order['status']}")
    
    # Check specifically for Raj Thapa's orders
    cursor.execute(f"SELECT id, customer_id, rider_id, status FROM orders WHERE rider_id = {placeholder}", (raj_thapa_id,))
    raj_orders = cursor.fetchall()
    
    print(f'\nRaj Thapa orders (ID: {raj_thapa_id}):')
    if raj_orders:
        for row in raj_orders:
            if isinstance(row, dict):
                print(f"  ID: {row['id']}, Status: {row['status']}")
            else:
                columns = [column[0] for column in cursor.description]
                order = dict(zip(columns, row))
                print(f"  ID: {order['id']}, Status: {order['status']}")
    else:
        print('  No orders found for Raj Thapa')
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_rider_assignment()

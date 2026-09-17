from app.db.database import get_connection, get_cursor, is_postgres

conn = get_connection()
cursor = get_cursor(conn)

try:
    # Get all orders without order_number
    cursor.execute("SELECT id FROM orders WHERE order_number IS NULL OR order_number = 0")
    rows = cursor.fetchall()
    
    if rows:
        # Get the current max order number
        cursor.execute("SELECT MAX(order_number) FROM orders")
        max_num = cursor.fetchone()[0] or 0
        
        # Update each order with a sequential number
        for row in rows:
            order_id = row[0] if not isinstance(row, dict) else row['id']
            max_num += 1
            cursor.execute("UPDATE orders SET order_number = ? WHERE id = ?", (max_num, order_id))
            print(f"Updated order {order_id} to order_number {max_num}")
        
        conn.commit()
        print(f"Updated {len(rows)} orders with sequential order numbers")
    else:
        print("No orders without order_number found")
        
    # Verify the update
    cursor.execute("SELECT id, order_number, customer_id FROM orders ORDER BY order_number")
    orders = cursor.fetchall()
    print("\nCurrent orders:")
    for order in orders:
        if isinstance(order, dict):
            print(f"ID: {order['id']}, Order Number: {order['order_number']}, Customer: {order['customer_id']}")
        else:
            print(f"ID: {order[0]}, Order Number: {order[1]}, Customer: {order[2]}")
            
finally:
    cursor.close()
    conn.close()

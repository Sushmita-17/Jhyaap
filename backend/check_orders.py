from app.db.database import get_connection, fetch_all_orders

orders = fetch_all_orders()
print(f'Orders in database: {len(orders)}')
for o in orders[:5]:
    print(f'Order {o.get("order_number", "N/A")}: {o.get("customer_name", "Unknown")} - Rs {o.get("total", 0)} - {o.get("created_at", "N/A")}')

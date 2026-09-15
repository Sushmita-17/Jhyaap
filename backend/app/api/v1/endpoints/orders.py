import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status as http_status, Request, Depends

from app.db.database import (
    fetch_orders_by_rider,
    fetch_all_orders,
    fetch_order_by_id,
    save_order,
    update_order_status,
    get_connection,
    is_postgres,
    save_delivery_rating,
    fetch_delivery_rating
)
from app.models.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrderStatusUpdate, PaymentConfirmation,
    CustomerAddressCreate, CustomerAddressUpdate, CustomerAddressResponse, DeliveryRatingCreate
)
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin
from app.api.v1.endpoints.coupons import fetch_coupon_by_code, save_coupon

router = APIRouter(prefix="/orders", tags=["orders"])

DELIVERY_FEE = 50.0
TAX_RATE = 0.13  # 13% tax


def create_notification(user_id: str, user_type: str, title: str, message: str, notification_type: str, order_id: str = None, action_link: str = None):
    """Helper function to create a notification using Supabase"""
    from app.db.supabase_client import get_supabase_client
    supabase = get_supabase_client()
    
    try:
        notification_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        notification_data = {
            "id": notification_id,
            "user_id": user_id,
            "user_type": user_type,
            "type": notification_type,
            "title": title,
            "message": message,
            "data": {"order_id": order_id} if order_id else {},
            "is_read": False,
            "created_at": now
        }
        
        supabase.table("notifications").insert(notification_data).execute()
    except Exception as e:
        print(f"Failed to create notification: {e}")


@router.get("", response_model=List[OrderResponse])
@limiter.limit(get_rate_limit("general"))
def get_orders(request: Request, rider_id: Optional[str] = None, status: Optional[str] = None):
    """
    Get all orders, optionally filtered by rider_id and status.
    If rider_id is provided, returns only that rider's orders.
    Rate limited to 100 requests per minute.
    """
    try:
        if rider_id:
            orders = fetch_orders_by_rider(rider_id, status=status)
        else:
            # Admin view: all orders (would need authentication middleware)
            orders = fetch_all_orders(status=status)
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderResponse)
@limiter.limit(get_rate_limit("general"))
def get_order(request: Request, order_id: str):
    """Get a specific order by ID. Rate limited to 100 requests per minute."""
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    return order


@router.get("/rider/{rider_id}", response_model=List[OrderResponse])
@limiter.limit(get_rate_limit("general"))
def get_rider_orders(request: Request, rider_id: str, status: Optional[str] = None):
    """Get all orders for a specific rider, optionally filtered by status. Rate limited to 100 requests per minute."""
    try:
        orders = fetch_orders_by_rider(rider_id, status=status)
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch rider orders: {str(e)}"
        )


@router.post("", response_model=OrderResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("general"))
def create_order(request: Request, payload: OrderCreate):
    """Create a new order. Rate limited to 100 requests per minute."""
    # Generate order ID if not provided
    order_data = payload.model_dump()
    order_data["id"] = str(uuid.uuid4())
    
    # Convert items to dict format for database
    items_list = [item.model_dump() for item in payload.items]
    order_data["items"] = items_list
    
    try:
        saved_order = save_order(order_data)

        if coupon is not None:
            coupon["usage_count"] = int(coupon.get("usage_count") or 0) + 1
            coupon["updated_at"] = datetime.now().isoformat()
            save_coupon(coupon)
        return saved_order
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.put("/{order_id}", response_model=OrderResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("general"))
def update_order(request: Request, order_id: str, payload: OrderUpdate):
    """Update an existing order (status, rider_id, notes). Rate limited to 100 requests per minute."""
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Update fields if provided
    if payload.status is not None:
        success = update_order_status(order_id, payload.status)
        if not success:
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order status."
            )
        order["status"] = payload.status
    
    if payload.rider_id is not None:
        order["rider_id"] = payload.rider_id
        # Save the updated order
        save_order(order)
    
    if payload.delivery_notes is not None:
        order["delivery_notes"] = payload.delivery_notes
        save_order(order)
    
    return order


@router.patch("/{order_id}/status")
@limiter.limit(get_rate_limit("general"))
def update_order_status_endpoint(request: Request, order_id: str, status: str):
    """
    Update only the status of an order. Rate limited to 100 requests per minute.
    This is the primary endpoint used by riders to advance order status.
    """
    valid_statuses = ["pending", "confirmed", "accepted", "preparing", "out_for_delivery", "picked_up", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Send SMS notification to customer for specific status changes
    if status in ["preparing", "out_for_delivery", "picked_up", "delivered"]:
        try:
            from app.db.database import get_connection, is_postgres
            from app.services.sms_service import send_order_notification_sms
            
            conn = get_connection()
            cursor = conn.cursor()
            
            # Fetch customer phone number and delivery area
            if is_postgres(conn):
                cursor.execute(
                    "SELECT phone_number, delivery_address FROM customers WHERE id = %s",
                    (order.get("customer_id"),)
                )
            else:
                cursor.execute(
                    "SELECT phone_number, delivery_address FROM customers WHERE id = ?",
                    (order.get("customer_id"),)
                )
            
            row = cursor.fetchone()
            if row:
                if isinstance(row, dict):
                    phone_number = row.get("phone_number")
                    delivery_address = row.get("delivery_address")
                else:
                    phone_number = row[0] if row else None
                    delivery_address = row[1] if len(row) > 1 else None
                
                # Get ETA based on delivery area
                eta_minutes = None
                if delivery_address and status in ["out_for_delivery", "picked_up"]:
                    # Extract area from delivery address (last part usually contains area name)
                    address_parts = delivery_address.split(',')
                    if address_parts:
                        area_name = address_parts[-1].strip()
                        # Simple ETA estimation based on common areas
                        # In production, this should come from delivery areas database
                        eta_map = {
                            "Thamel": 35, "New Baneshwor": 35, "Putalisadak": 35, "Durbarmarg": 35,
                            "New Road": 35, "Kamaladi": 35, "Asan": 35, "Maitighar": 35,
                            "Lazimpat": 45, "Baluwatar": 45, "Maharajgunj": 45, "Naxal": 45,
                            "Sinamangal": 45, "Chabahil": 45, "Gaushala": 45, "Gongabu": 45,
                            "Samakhusi": 45, "Balaju": 45, "Swayambhu": 45, "Boudha": 45,
                            "Koteshwor": 60, "Jorpati": 60, "Kapan": 60, "Budhanilkantha": 60,
                            "Kalanki": 60, "Kalimati": 60, "Teku": 60, "Tripureshwor": 60,
                            "Shankhamul": 60, "Kirtipur": 75, "Panga": 75, "Nayabazar": 75,
                            "Satdobato": 60, "Tikathali": 60, "Pulchowk": 55, "Jawalakhel": 55,
                            "Kupondole": 55, "Sanepa": 55, "Ekantakuna": 55, "Lagankhel": 55,
                            "Kumaripati": 55, "Imadol": 65, "Lubhu": 65, "Godawari": 90,
                            "Bungamati": 85, "Harisiddhi": 85, "Thaiba": 90, "Patan": 70,
                            "Dhobighat": 75, "Nakhipot": 75, "Chapagaun": 75, "Balkhu": 75,
                            "Satungal": 75, "Kuleshwor": 75, "Thapathali": 70, "Machhegaun": 75,
                            "Bhaktapur": 90, "Madhyapur Thimi": 85, "Suryabinayak": 95,
                            "Jagati": 90, "Kausaltar": 85, "Balkot": 90, "Sallaghari": 95,
                            "Changunarayan": 100, "Sirutar": 95, "Bode": 90, "Siddhapur": 90,
                            "Tatopati": 90, "Byasi": 90, "Gatthaghar": 90, "Kamalbinayak": 90,
                            "Nagarikot": 90
                        }
                        # Try to match area name (case insensitive)
                        for area, eta in eta_map.items():
                            if area.lower() in area_name.lower():
                                eta_minutes = eta
                                break
                        # Default ETA if no match
                        if eta_minutes is None:
                            eta_minutes = 45
                
                if phone_number:
                    # Send SMS notification with ETA
                    import asyncio
                    asyncio.create_task(send_order_notification_sms(phone_number, order_id, status, eta_minutes))
            
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Failed to send SMS notification: {e}")
    
    # When admin changes status to "out_for_delivery", auto-assign an available rider
    if status == "out_for_delivery" and not order.get("rider_id"):
        from app.db.database import fetch_available_riders
        available_riders = fetch_available_riders()
        if available_riders:
            # Assign the first available rider
            rider_id = available_riders[0]["id"]
            order["rider_id"] = rider_id
            order["status"] = "out_for_delivery"
            order["updated_at"] = datetime.now().isoformat()
            save_order(order)
            
            # Send notification to customer about rider assignment
            from app.db.database import fetch_all_riders
            riders = fetch_all_riders()
            rider = next((r for r in riders if r["id"] == rider_id), None)
            if rider:
                create_notification(
                    user_id=order["customer_id"],
                    user_type="customer",
                    title="Rider Assigned",
                    message=f"Your order has been assigned to rider {rider['name']}. Waiting for rider acceptance.",
                    notification_type="order_status",
                    order_id=order_id
                )
            
            return {"message": f"Order status updated to 'out_for_delivery' and assigned to rider {rider_id}. Waiting for rider acceptance.", "success": True, "rider_id": rider_id}
        else:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="No available riders to assign for delivery"
            )
    
    success = update_order_status(order_id, status)
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    return {"message": f"Order status updated to '{status}'", "success": True}


@router.post("/rider/{rider_id}/accept/{order_id}")
@limiter.limit(get_rate_limit("general"))
def rider_accept_order(request: Request, rider_id: str, order_id: str):
    """
    Rider accepts the order assignment. This confirms rider is ready for delivery.
    Only the assigned rider can accept the order.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order is assigned to this rider
    if order.get("rider_id") != rider_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="This order is not assigned to you."
        )
    
    # Update order status to accepted
    success = update_order_status(order_id, "accepted")
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )
    
    # Send notification to customer that rider accepted
    # Fixed import - create_notification is defined locally
    from app.db.database import fetch_all_riders
    riders = fetch_all_riders()
    rider = next((r for r in riders if r["id"] == rider_id), None)
    if rider:
        create_notification(
            user_id=order["customer_id"],
            user_type="customer",
            title="Rider Accepted Order",
            message=f"Rider {rider['name']} has accepted your order and is heading to the store.",
            notification_type="order_status",
            order_id=order_id
        )
        
        # Also send notification to admin
        create_notification(
            user_id="admin",
            user_type="admin",
            title="Rider Accepted Order",
            message=f"Rider {rider['name']} has accepted order #{order_id}. Ready for pickup.",
            notification_type="rider_acceptance",
            order_id=order_id
        )
    
    return {"message": "Order accepted successfully. Ready for pickup.", "success": True}


@router.post("/rider/{rider_id}/pickup/{order_id}")
@limiter.limit(get_rate_limit("general"))
def rider_pickup_order(request: Request, rider_id: str, order_id: str):
    """
    Rider confirms they have picked up the order from the store.
    This triggers the actual delivery tracking simulation.
    Only the assigned rider can pick up the order.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order is assigned to this rider
    if order.get("rider_id") != rider_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="This order is not assigned to you."
        )
    
    # Check if order is in correct state for pickup
    if order["status"] != "out_for_delivery":
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Order with status '{order['status']}' cannot be picked up."
        )
    
    # Update order status to picked_up
    success = update_order_status(order_id, "picked_up")
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )
    
    # Send notification to customer that rider picked up order
    from app.db.database import fetch_all_riders
    riders = fetch_all_riders()
    rider = next((r for r in riders if r["id"] == rider_id), None)
    if rider:
        create_notification(
            user_id=order["customer_id"],
            user_type="customer",
            title="Order Picked Up",
            message=f"Rider {rider['name']} has picked up your order. Live tracking started!",
            notification_type="order_status",
            order_id=order_id
        )
        
        # Also send notification to admin that rider started delivery
        create_notification(
            user_id="admin",
            user_type="admin",
            title="Rider Started Delivery",
            message=f"Rider {rider['name']} has picked up order #{order.get('order_number', order_id)}. Live tracking active.",
            notification_type="delivery_started",
            order_id=order_id
        )
    
    return {"message": "Order picked up successfully. Delivery tracking started.", "success": True}


# Customer-specific endpoints
def calculate_coupon_discount(code: str, subtotal: float, delivery_fee: float):
    coupon = fetch_coupon_by_code(code.upper())
    if not coupon or not coupon.get("is_active"):
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Invalid or inactive coupon code.")

    def parse_datetime(value):
        parsed = value if isinstance(value, datetime) else datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed

    now = datetime.now(timezone.utc)
    if now < parse_datetime(coupon["valid_from"]) or now > parse_datetime(coupon["valid_until"]):
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Coupon is expired or not yet valid.")
    if coupon.get("usage_limit") and coupon.get("usage_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Coupon usage limit reached.")
    if subtotal < float(coupon.get("minimum_order_amount") or 0):
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Minimum order amount for this coupon has not been met.")

    value = float(coupon.get("value") or 0)
    coupon_type = coupon.get("coupon_type")
    if coupon_type == "percentage":
        discount = subtotal * (value / 100)
    elif coupon_type == "fixed_amount":
        discount = value
    elif coupon_type == "free_delivery":
        discount = delivery_fee
    else:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Unsupported coupon type.")
    maximum = coupon.get("max_discount_amount")
    if maximum is not None:
        discount = min(discount, float(maximum))
    return min(max(discount, 0), subtotal + delivery_fee), coupon

@router.post("/customer/create", response_model=OrderResponse)
@limiter.limit(get_rate_limit("general"))
def create_customer_order(request: Request, payload: OrderCreate):
    """
    Create a new order for a customer with automatic calculations.
    Automatically calculates subtotal, tax, and total based on items.
    Creates notification for admin about new order.
    Rate limited to 100 requests per minute.
    """
    # Calculate subtotal from items
    subtotal = sum(item.price * item.quantity for item in payload.items)
    
    # Calculate tax
    tax = subtotal * TAX_RATE
    
    # Calculate total
    total = subtotal + DELIVERY_FEE + tax
    
    # Validate and calculate the coupon on the server. Never trust a discount
    # amount calculated only in the browser.
    discount_amount = 0.0
    coupon = None
    if payload.coupon_code:
        discount_amount, coupon = calculate_coupon_discount(payload.coupon_code, subtotal, DELIVERY_FEE)
    
    # Apply discount
    total -= discount_amount
    
    # Generate order data
    order_data = {
        "id": payload.client_order_id or str(uuid.uuid4()),
        "customer_id": payload.customer_id,
        "rider_id": None,
        "status": "pending",
        "items": [item.model_dump() for item in payload.items],
        "subtotal": subtotal,
        "delivery_fee": DELIVERY_FEE,
        "tax": tax,
        "total": total,
        "delivery_address": payload.delivery_address,
        "delivery_notes": payload.delivery_notes,
        "payment_status": "pending",
        "payment_method": payload.payment_method,
        "coupon_code": payload.coupon_code,
        "discount_amount": discount_amount,
        "payment_screenshot": payload.payment_screenshot,
        "customer_phone": payload.customer_phone,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    try:
        saved_order = save_order(order_data)

        if coupon is not None:
            coupon["usage_count"] = int(coupon.get("usage_count") or 0) + 1
            coupon["updated_at"] = datetime.now().isoformat()
            save_coupon(coupon)
        
        # Create notification for admin about new order
        from app.db.database import fetch_customer_by_id
        customer = fetch_customer_by_id(payload.customer_id)
        customer_name = customer.get("name", "Unknown") if customer else "Unknown"
        customer_phone = customer.get("phone_number", "N/A") if customer else "N/A"
        
        # Format items for notification
        items_summary = ", ".join([f"{item['name']} x{item['quantity']}" for item in saved_order.get("items", [])[:3]])
        if len(saved_order.get("items", [])) > 3:
            items_summary += f" +{len(saved_order['items']) - 3} more"
        
        # Format order time
        order_time = datetime.fromisoformat(saved_order["created_at"]).strftime("%H:%M")
        
        create_notification(
            user_id="admin",
            user_type="admin",
            title="New Order Received",
            message=f"Order No {saved_order.get('order_number', 'N/A')} - Rs {saved_order['total']} | {customer_name} | {customer_phone} | {items_summary} | {order_time}",
            notification_type="order_created",
            order_id=saved_order["id"]
        )
        
        return saved_order
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
@limiter.limit(get_rate_limit("general"))
def get_customer_orders(request: Request, customer_id: str, status: Optional[str] = None):
    """
    Get all orders for a specific customer, optionally filtered by status.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            if status:
                cursor.execute(
                    "SELECT * FROM orders WHERE customer_id = %s AND status = %s ORDER BY created_at DESC",
                    (customer_id, status)
                )
            else:
                cursor.execute(
                    "SELECT * FROM orders WHERE customer_id = %s ORDER BY created_at DESC",
                    (customer_id,)
                )
        else:
            if status:
                cursor.execute(
                    "SELECT * FROM orders WHERE customer_id = ? AND status = ? ORDER BY created_at DESC",
                    (customer_id, status)
                )
            else:
                cursor.execute(
                    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
                    (customer_id,)
                )
        
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            if isinstance(row, dict):
                orders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                orders.append(dict(zip(columns, row)))
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch customer orders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.delete("/{order_id}/cancel")
@limiter.limit(get_rate_limit("general"))
def cancel_order(request: Request, order_id: str):
    """
    Cancel an order. Only allowed if order is in 'pending' or 'accepted' status.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order can be cancelled
    if order["status"] not in ["pending", "accepted"]:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Order with status '{order['status']}' cannot be cancelled."
        )
    
    # Update order status to cancelled
    success = update_order_status(order_id, "cancelled")
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel order."
        )
    
    return {"message": "Order cancelled successfully", "success": True}


# Customer address management endpoints
@router.post("/customer/address", response_model=CustomerAddressResponse)
@limiter.limit(get_rate_limit("general"))
def create_customer_address(request: Request, payload: CustomerAddressCreate):
    """
    Create a new address for a customer.
    If is_default is true, removes default status from other addresses.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # If setting as default, remove default from other addresses
        if payload.is_default:
            if is_postgres(conn):
                cursor.execute(
                    "UPDATE customer_addresses SET is_default = false WHERE customer_id = %s",
                    (payload.customer_id,)
                )
            else:
                cursor.execute(
                    "UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?",
                    (payload.customer_id,)
                )
        
        # Create new address
        address_data = {
            "id": str(uuid.uuid4()),
            "customer_id": payload.customer_id,
            "street": payload.street,
            "landmark": payload.landmark,
            "city": payload.city,
            "postal_code": payload.postal_code,
            "is_default": payload.is_default,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO customer_addresses 
                (id, customer_id, street, landmark, city, postal_code, is_default, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                address_data["id"],
                address_data["customer_id"],
                address_data["street"],
                address_data["landmark"],
                address_data["city"],
                address_data["postal_code"],
                address_data["is_default"],
                address_data["created_at"],
                address_data["updated_at"]
            ))
        else:
            cursor.execute("""
                INSERT INTO customer_addresses 
                (id, customer_id, street, landmark, city, postal_code, is_default, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                address_data["id"],
                address_data["customer_id"],
                address_data["street"],
                address_data["landmark"],
                address_data["city"],
                address_data["postal_code"],
                address_data["is_default"],
                address_data["created_at"],
                address_data["updated_at"]
            ))
        
        conn.commit()
        return address_data
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create address: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/customer/{customer_id}/addresses", response_model=List[CustomerAddressResponse])
@limiter.limit(get_rate_limit("general"))
def get_customer_addresses(request: Request, customer_id: str):
    """
    Get all addresses for a specific customer.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM customer_addresses WHERE customer_id = %s ORDER BY is_default DESC, created_at DESC",
                (customer_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
                (customer_id,)
            )
        
        rows = cursor.fetchall()
        addresses = []
        for row in rows:
            if isinstance(row, dict):
                addresses.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                addresses.append(dict(zip(columns, row)))
        
        return addresses
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch addresses: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.put("/customer/address/{address_id}", response_model=CustomerAddressResponse)
@limiter.limit(get_rate_limit("general"))
def update_customer_address(request: Request, address_id: str, payload: CustomerAddressUpdate):
    """
    Update an existing customer address.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get existing address
        if is_postgres(conn):
            cursor.execute("SELECT * FROM customer_addresses WHERE id = %s", (address_id,))
        else:
            cursor.execute("SELECT * FROM customer_addresses WHERE id = ?", (address_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Address with ID '{address_id}' not found."
            )
        
        if isinstance(row, dict):
            address = dict(row)
        else:
            columns = [col[0] for col in cursor.description]
            address = dict(zip(columns, row))
        
        # Update fields if provided
        if payload.street is not None:
            address["street"] = payload.street
        if payload.landmark is not None:
            address["landmark"] = payload.landmark
        if payload.city is not None:
            address["city"] = payload.city
        if payload.postal_code is not None:
            address["postal_code"] = payload.postal_code
        if payload.is_default is not None:
            # If setting as default, remove default from other addresses
            if payload.is_default:
                if is_postgres(conn):
                    cursor.execute(
                        "UPDATE customer_addresses SET is_default = false WHERE customer_id = %s AND id != %s",
                        (address["customer_id"], address_id)
                    )
                else:
                    cursor.execute(
                        "UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND id != ?",
                        (address["customer_id"], address_id)
                    )
            address["is_default"] = payload.is_default
        
        address["updated_at"] = datetime.now().isoformat()
        
        # Update address
        if is_postgres(conn):
            cursor.execute("""
                UPDATE customer_addresses 
                SET street = %s, landmark = %s, city = %s, postal_code = %s, is_default = %s, updated_at = %s
                WHERE id = %s
            """, (
                address["street"],
                address["landmark"],
                address["city"],
                address["postal_code"],
                address["is_default"],
                address["updated_at"],
                address_id
            ))
        else:
            cursor.execute("""
                UPDATE customer_addresses 
                SET street = ?, landmark = ?, city = ?, postal_code = ?, is_default = ?, updated_at = ?
                WHERE id = ?
            """, (
                address["street"],
                address["landmark"],
                address["city"],
                address["postal_code"],
                address["is_default"],
                address["updated_at"],
                address_id
            ))
        
        conn.commit()
        return address
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update address: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.delete("/customer/address/{address_id}")
@limiter.limit(get_rate_limit("general"))
def delete_customer_address(request: Request, address_id: str):
    """
    Delete a customer address.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("DELETE FROM customer_addresses WHERE id = %s", (address_id,))
        else:
            cursor.execute("DELETE FROM customer_addresses WHERE id = ?", (address_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Address with ID '{address_id}' not found."
            )
        
        return {"message": "Address deleted successfully", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete address: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


# Rider-specific order action endpoints
@router.post("/rider/{rider_id}/reject/{order_id}")
@limiter.limit(get_rate_limit("general"))
def rider_reject_order(request: Request, rider_id: str, order_id: str, reason: Optional[str] = None):
    """
    Rider rejects an order. Only allowed if order is assigned to this rider.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order is assigned to this rider
    if order.get("rider_id") != rider_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Order not assigned to this rider."
        )
    
    # Check if order can be rejected
    if order["status"] not in ["accepted", "pending"]:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Order with status '{order['status']}' cannot be rejected."
        )
    
    # Remove rider assignment and reset to pending
    order["rider_id"] = None
    order["status"] = "pending"
    order["updated_at"] = datetime.now().isoformat()
    
    try:
        save_order(order)
        return {"message": "Order rejected successfully", "success": True}
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject order: {str(e)}"
        )


@router.post("/rider/{rider_id}/deliver/{order_id}")
@limiter.limit(get_rate_limit("general"))
def rider_deliver_order(request: Request, rider_id: str, order_id: str, payment_confirmed: bool = False, payload: PaymentConfirmation = PaymentConfirmation()):
    """
    Rider marks order as delivered. Only allowed if order is assigned to this rider and in 'out_for_delivery' status.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order is assigned to this rider
    if order.get("rider_id") != rider_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Order not assigned to this rider."
        )
    
    # Check if order can be delivered
    if order["status"] != "out_for_delivery":
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Order with status '{order['status']}' cannot be marked as delivered."
        )
    
    # Update order status to delivered
    order["status"] = "delivered"
    order["payment_status"] = "paid" if payment_confirmed else "pending"
    order["updated_at"] = datetime.now().isoformat()
    
    try:
        save_order(order)

        # Keep a durable payment record for COD, online, and split payments.
        from app.db.supabase_client import get_supabase_client
        cash_amount = float(payload.cash_amount or 0)
        online_amount = float(payload.online_amount or 0)
        paid_amount = cash_amount + online_amount
        payment_method = "split" if cash_amount > 0 and online_amount > 0 else ("cod" if cash_amount > 0 else "online")
        get_supabase_client().table("payments").insert({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "customer_id": order.get("customer_id"),
            "amount": paid_amount,
            "method": payment_method,
            "status": "paid" if payment_confirmed else "pending",
            "paid_at": datetime.now().isoformat() if payment_confirmed else None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }).execute()
        
        # Log delivery earnings for rider
        from app.db.database import save_earning
        earning_data = {
            "id": str(uuid.uuid4()),
            "rider_id": rider_id,
            "order_id": order_id,
            "delivery_fee": order.get("delivery_fee", DELIVERY_FEE),
            "earned_at": datetime.now().isoformat()
        }
        save_earning(earning_data)
        
        # Create notification for customer
        create_notification(
            user_id=order["customer_id"],
            user_type="customer",
            title="Order Delivered",
            message="Your order has been successfully delivered. Thank you for your order!",
            notification_type="delivery",
            order_id=order_id
        )
        
        return {"message": "Order marked as delivered successfully", "success": True}
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deliver order: {str(e)}"
        )


@router.get("/rider/{rider_id}/available")
@limiter.limit(get_rate_limit("general"))
def get_available_orders_for_rider(request: Request, rider_id: str):
    """
    Get all available orders (pending orders without rider assignment).
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM orders WHERE status = 'pending' AND rider_id IS NULL ORDER BY created_at DESC"
            )
        else:
            cursor.execute(
                "SELECT * FROM orders WHERE status = 'pending' AND rider_id IS NULL ORDER BY created_at DESC"
            )
        
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            if isinstance(row, dict):
                orders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                orders.append(dict(zip(columns, row)))
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available orders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


# Order tracking system
@router.get("/{order_id}/tracking")
@limiter.limit(get_rate_limit("general"))
def get_order_tracking(request: Request, order_id: str):
    """
    Get real-time tracking information for an order including current status, rider info, and ETA.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Calculate estimated time based on status
    status_eta = {
        "pending": "Waiting for rider assignment",
        "accepted": "Order accepted, preparing for pickup",
        "preparing": "Order is being prepared",
        "out_for_delivery": "Order is out for delivery",
        "delivered": "Order delivered",
        "cancelled": "Order cancelled"
    }
    
    # Get rider information if assigned
    rider_info = None
    if order.get("rider_id"):
        from app.db.database import fetch_rider_by_id
        rider = fetch_rider_by_id(order["rider_id"])
        if rider:
            rider_info = {
                "id": rider.get("id"),
                "name": rider.get("name"),
                "phone_number": rider.get("phone_number"),
                "vehicle_type": rider.get("vehicle_type")
            }
    
    tracking_data = {
        "order_id": order_id,
        "current_status": order["status"],
        "status_message": status_eta.get(order["status"], "Unknown status"),
        "rider": rider_info,
        "delivery_address": order.get("delivery_address"),
        "created_at": order.get("created_at"),
        "updated_at": order.get("updated_at"),
        "estimated_delivery": calculate_eta(order["status"])
    }
    
    return tracking_data


def calculate_eta(status: str) -> str:
    """Calculate estimated time of arrival based on order status"""
    from datetime import datetime, timezone, timedelta
    
    now = datetime.now()
    
    if status == "pending":
        eta = now + timedelta(minutes=45)  # 45 mins for assignment + pickup
    elif status == "accepted":
        eta = now + timedelta(minutes=30)  # 30 mins for preparation
    elif status == "preparing":
        eta = now + timedelta(minutes=15)  # 15 mins for pickup
    elif status == "out_for_delivery":
        eta = now + timedelta(minutes=20)  # 20 mins for delivery
    elif status == "delivered":
        eta = now
    else:
        eta = now + timedelta(minutes=60)  # Default 1 hour
    
    return eta.isoformat()


@router.get("/{order_id}/history")
@limiter.limit(get_rate_limit("general"))
def get_order_status_history(request: Request, order_id: str):
    """
    Get the status history of an order.
    Note: This is a simplified version. For full history, you'd need a separate order_status_history table.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Simplified status history based on current status and timestamps
    # In production, you would have a separate table to track all status changes
    status_history = [
        {
            "status": "pending",
            "timestamp": order.get("created_at"),
            "message": "Order placed successfully"
        }
    ]
    
    if order["status"] != "pending":
        status_history.append({
            "status": "accepted",
            "timestamp": order.get("updated_at"),
            "message": "Order accepted by rider"
        })
    
    if order["status"] in ["preparing", "out_for_delivery", "delivered"]:
        status_history.append({
            "status": "preparing",
            "timestamp": order.get("updated_at"),
            "message": "Order is being prepared"
        })
    
    if order["status"] in ["out_for_delivery", "delivered"]:
        status_history.append({
            "status": "out_for_delivery",
            "timestamp": order.get("updated_at"),
            "message": "Order is out for delivery"
        })
    
    if order["status"] == "delivered":
        status_history.append({
            "status": "delivered",
            "timestamp": order.get("updated_at"),
            "message": "Order delivered successfully"
        })
    
    if order["status"] == "cancelled":
        status_history.append({
            "status": "cancelled",
            "timestamp": order.get("updated_at"),
            "message": "Order cancelled"
        })
    
    return {
        "order_id": order_id,
        "status_history": status_history
    }

@router.get("/{order_id}/rating")
@limiter.limit(get_rate_limit("general"))
def get_delivery_rating(request: Request, order_id: str):
    rating = fetch_delivery_rating(order_id)
    return rating or {"order_id": order_id, "rating": None, "review": None}


@router.post("/{order_id}/notify-arrival")
@limiter.limit(get_rate_limit("general"))
def notify_customer_arrival(request: Request, order_id: str, payload: dict = None):
    """
    Rider notifies customer that they are arriving at the destination.
    This is called when rider reaches 'near_destination' status.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Get rider name from payload or fetch from riders table
    rider_name = "Rider"
    if payload and payload.get("rider_name"):
        rider_name = payload["rider_name"]
    elif order.get("rider_id"):
        from app.db.database import fetch_all_riders
        riders = fetch_all_riders()
        rider = next((r for r in riders if r["id"] == order["rider_id"]), None)
        if rider:
            rider_name = rider["name"]
    
    # Create notification for customer
    create_notification(
        user_id=order["customer_id"],
        user_type="customer",
        title="Rider Arriving!",
        message=f"Your rider {rider_name} is arriving at your location. Please be ready to receive your order.",
        notification_type="rider_arrival",
        order_id=order_id
    )
    
    # Mark arrival notification as sent in order
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if is_postgres(conn):
            cursor.execute(
                "UPDATE orders SET arrival_notification_sent = true, updated_at = %s WHERE id = %s",
                (datetime.now().isoformat(), order_id)
            )
        else:
            cursor.execute(
                "UPDATE orders SET arrival_notification_sent = 1, updated_at = ? WHERE id = ?",
                (datetime.now().isoformat(), order_id)
            )
        conn.commit()
    except Exception as e:
        # Column might not exist yet, that's okay
        print(f"Warning: Could not mark arrival notification as sent: {e}")
    finally:
        cursor.close()
        conn.close()
    
    return {"message": "Customer notified of rider arrival", "success": True}


@router.get("/{order_id}/notifications")
@limiter.limit(get_rate_limit("general"))
def get_order_notifications(request: Request, order_id: str):
    """
    Get notifications for a specific order, including arrival notifications.
    Rate limited to 100 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if arrival notification has been sent
    has_arrival_notification = False
    rider_name = None
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT arrival_notification_sent, rider_id FROM orders WHERE id = %s",
                (order_id,)
            )
        else:
            cursor.execute(
                "SELECT arrival_notification_sent, rider_id FROM orders WHERE id = ?",
                (order_id,)
            )
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                has_arrival_notification = row.get("arrival_notification_sent", False)
                rider_id = row.get("rider_id")
            else:
                has_arrival_notification = row[0] if row else False
                rider_id = row[1] if len(row) > 1 else None
            
            # Get rider name if arrival notification was sent
            if has_arrival_notification and rider_id:
                from app.db.database import fetch_all_riders
                riders = fetch_all_riders()
                rider = next((r for r in riders if r["id"] == rider_id), None)
                if rider:
                    rider_name = rider["name"]
    except Exception as e:
        # Column might not exist yet, check notifications table instead
        print(f"Warning: Could not check arrival_notification_sent column: {e}")
        
        # Fallback: check notifications table
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        try:
            result = supabase.table("notifications").select("*").eq("order_id", order_id).eq("type", "rider_arrival").eq("is_read", False).execute()
            if result.data:
                has_arrival_notification = True
                if result.data[0].get("data", {}).get("rider_name"):
                    rider_name = result.data[0]["data"]["rider_name"]
        except Exception as e2:
            print(f"Could not check notifications table: {e2}")
    finally:
        cursor.close()
        conn.close()
    
    return {
        "order_id": order_id,
        "hasArrivalNotification": has_arrival_notification,
        "rider_name": rider_name
    }


@router.post("/{order_id}/rating")
@limiter.limit(get_rate_limit("general"))
def create_delivery_rating(request: Request, order_id: str, payload: DeliveryRatingCreate):
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.get("customer_id") != payload.customer_id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="This order does not belong to the customer.")
    if order.get("status") != "delivered":
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail="Ratings are available after delivery.")

    saved = save_delivery_rating({
        "order_id": order_id,
        "customer_id": payload.customer_id,
        "rider_id": order.get("rider_id"),
        "rating": payload.rating,
        "review": payload.review,
        "created_at": datetime.now().isoformat(),
    })
    return saved






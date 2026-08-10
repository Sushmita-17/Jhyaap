import requests
import json
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

def test_notification_system():
    print("=== Testing Notification System ===\n")
    
    # Generate random phone number to avoid conflicts
    phone_number = f"98{random.randint(10000000, 99999999)}"
    
    # Step 1: Register a customer
    print("1. Registering a customer...")
    customer_data = {
        "phone_number": phone_number,
        "name": "Test Customer",
        "email": "test@example.com",
        "password": "Test@1234"
    }
    
    response = requests.post(f"{BASE_URL}/customers/register", json=customer_data)
    if response.status_code == 200:
        customer = response.json()
        customer_id = customer["id"]
        print(f"✓ Customer registered: {customer_id}")
    else:
        print(f"✗ Failed to register customer: {response.text}")
        return
    
    # Step 2: Login to get JWT token
    print("\n2. Logging in to get JWT token...")
    login_data = {
        "phone_number": phone_number,
        "password": "Test@1234"
    }
    
    response = requests.post(f"{BASE_URL}/customers/login", json=login_data)
    if response.status_code == 200:
        login_response = response.json()
        token = login_response["access_token"]
        print(f"✓ Login successful, got token")
    else:
        print(f"✗ Failed to login: {response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 3: Create a manual notification
    print("\n3. Creating a manual notification...")
    notification_data = {
        "customer_id": customer_id,
        "title": "Test Notification",
        "message": "This is a test notification",
        "notification_type": "system"
    }
    
    response = requests.post(f"{BASE_URL}/notifications", json=notification_data)
    if response.status_code == 200:
        notification = response.json()
        notification_id = notification["id"]
        print(f"✓ Notification created: {notification_id}")
    else:
        print(f"✗ Failed to create notification: {response.text}")
    
    # Step 4: Get customer notifications (with authentication)
    print("\n4. Getting customer notifications (with authentication)...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}", headers=headers)
    if response.status_code == 200:
        notifications = response.json()
        print(f"✓ Retrieved {len(notifications)} notifications")
        for notif in notifications:
            print(f"  - {notif['title']}: {notif['message']}")
    else:
        print(f"✗ Failed to get notifications: {response.text}")
    
    # Step 5: Get unread count
    print("\n5. Getting unread notification count...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}/unread-count", headers=headers)
    if response.status_code == 200:
        count_data = response.json()
        print(f"✓ Unread count: {count_data['unread_count']}")
    else:
        print(f"✗ Failed to get unread count: {response.text}")
    
    # Step 6: Mark notification as read
    print("\n6. Marking notification as read...")
    if 'notification_id' in locals():
        update_data = {"is_read": True}
        response = requests.put(f"{BASE_URL}/notifications/{notification_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            print(f"✓ Notification marked as read")
        else:
            print(f"✗ Failed to mark as read: {response.text}")
    
    # Step 7: Try to access another customer's notifications (should fail)
    print("\n7. Testing access control (trying to access another customer's notifications)...")
    fake_customer_id = "fake-customer-id"
    response = requests.get(f"{BASE_URL}/notifications/customer/{fake_customer_id}", headers=headers)
    if response.status_code == 403:
        print(f"✓ Access control working - 403 Forbidden as expected")
    else:
        print(f"✗ Access control failed - got status {response.status_code}")
    
    # Step 8: Try without authentication (should fail)
    print("\n8. Testing authentication requirement (no token)...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}")
    if response.status_code == 401:
        print(f"✓ Authentication working - 401 Unauthorized as expected")
    else:
        print(f"✗ Authentication failed - got status {response.status_code}")
    
    # Step 9: Create an order to trigger automatic notifications
    print("\n9. Creating an order to test automatic notifications...")
    order_data = {
        "customer_id": customer_id,
        "items": [
            {
                "product_id": "test-product-1",
                "name": "Test Product",
                "quantity": 2,
                "price": 100.0
            }
        ],
        "delivery_address": "Test Address, Kathmandu",
        "payment_method": "cod"
    }
    
    response = requests.post(f"{BASE_URL}/orders/customer/create", json=order_data)
    if response.status_code == 200:
        order = response.json()
        order_id = order["id"]
        print(f"✓ Order created: {order_id}")
    else:
        print(f"✗ Failed to create order: {response.text}")
        order_id = None
    
    # Step 10: Check if order creation notification was created
    print("\n10. Checking for order-related notifications...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}", headers=headers)
    if response.status_code == 200:
        notifications = response.json()
        order_notifications = [n for n in notifications if n.get("notification_type") in ["order_status", "delivery"]]
        print(f"✓ Found {len(order_notifications)} order-related notifications")
        for notif in order_notifications:
            print(f"  - {notif['title']}: {notif['message']}")
    
    # Step 11: Test bulk mark as read
    print("\n11. Testing bulk mark as read...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}", headers=headers)
    if response.status_code == 200:
        notifications = response.json()
        notification_ids = [n["id"] for n in notifications if not n["is_read"]]
        
        if notification_ids:
            bulk_data = {"notification_ids": notification_ids, "is_read": True}
            response = requests.post(f"{BASE_URL}/notifications/bulk-mark-read", json=bulk_data, headers=headers)
            if response.status_code == 200:
                print(f"✓ Bulk marked {len(notification_ids)} notifications as read")
            else:
                print(f"✗ Failed to bulk mark as read: {response.text}")
        else:
            print("✓ No unread notifications to mark")
    
    # Step 12: Test clear all notifications
    print("\n12. Testing clear all notifications...")
    response = requests.delete(f"{BASE_URL}/notifications/customer/{customer_id}/clear-all", headers=headers)
    if response.status_code == 200:
        print(f"✓ All notifications cleared")
    else:
        print(f"✗ Failed to clear notifications: {response.text}")
    
    # Step 13: Verify notifications are cleared
    print("\n13. Verifying notifications are cleared...")
    response = requests.get(f"{BASE_URL}/notifications/customer/{customer_id}", headers=headers)
    if response.status_code == 200:
        notifications = response.json()
        print(f"✓ Notification count after clear: {len(notifications)}")
    else:
        print(f"✗ Failed to get notifications: {response.text}")
    
    print("\n=== Notification System Test Complete ===")
    print(f"\nCustomer ID: {customer_id}")
    print(f"JWT Token: {token[:50]}..." if token else "No token")
    print(f"Order ID: {order_id}" if order_id else "No order created")

if __name__ == "__main__":
    test_notification_system()

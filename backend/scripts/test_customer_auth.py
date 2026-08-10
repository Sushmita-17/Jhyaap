import requests
import json

BASE_URL = "http://localhost:8000/api/v1/customers"

def test_customer_register():
    """Test customer registration"""
    print("Testing Customer Registration...")
    
    payload = {
        "name": "Test Customer",
        "phone_number": "9811223345",
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Customer registration successful!")
            return response.json()
        else:
            print("❌ Customer registration failed")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def test_customer_login():
    """Test customer login"""
    print("\nTesting Customer Login...")
    
    payload = {
        "phone_number": "9811223345",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Customer login successful!")
            return response.json()
        else:
            print("❌ Customer login failed")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def test_otp_request():
    """Test OTP request"""
    print("\nTesting OTP Request...")
    
    payload = {
        "phone_number": "9811223346"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/otp/request", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ OTP request successful!")
            return response.json()
        else:
            print("❌ OTP request failed")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def test_customer_profile():
    """Test getting customer profile"""
    print("\nTesting Customer Profile...")
    
    # First login to get token
    login_payload = {
        "phone_number": "9811223345",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/login", json=login_payload)
        if login_response.status_code != 200:
            print("❌ Login failed, cannot test profile")
            return
        
        token = login_response.json().get("access_token")
        customer_id = login_response.json().get("customer", {}).get("id")
        
        # Get customer profile
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BASE_URL}/{customer_id}", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Customer profile fetch successful!")
        else:
            print("❌ Customer profile fetch failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("Customer Authentication Test Suite")
    print("=" * 50)
    
    # Test registration
    test_customer_register()
    
    # Test login
    test_customer_login()
    
    # Test OTP request
    test_otp_request()
    
    # Test customer profile
    test_customer_profile()
    
    print("\n" + "=" * 50)
    print("Test Suite Complete")
    print("=" * 50)

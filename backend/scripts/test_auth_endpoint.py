import requests
import json

def test_admin_login():
    """Test admin login endpoint"""
    url = 'http://127.0.0.1:8001/api/v1/auth/admin-login'
    payload = {
        'email': 'admin@jhyaap.com',
        'password': 'admin123'
    }
    
    print(f"Testing login to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_login()

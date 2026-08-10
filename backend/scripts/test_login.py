import requests
import json

url = "http://127.0.0.1:8000/api/v1/auth/rider-login"
payload = {
    "phone_number": "9811223344",
    "password": "password123"
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        print(f"Access Token: {data.get('access_token')}")
        print(f"Rider Data: {data.get('rider')}")
    else:
        print(f"❌ Login failed")
        
except Exception as e:
    print(f"Error: {e}")

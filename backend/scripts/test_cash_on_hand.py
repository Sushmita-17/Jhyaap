import requests

url = "http://localhost:8000/api/v1/earnings/rider/3b37a365-9113-4ba8-999d-153beaf68080/cash-on-hand"

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

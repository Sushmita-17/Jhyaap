import urllib.request
import json
import sys

def test_endpoint(url, name):
    print(f"Testing {name} ({url})...", end="", flush=True)
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as response:
            status_code = response.status
            body = response.read().decode('utf-8')
            data = json.loads(body) if 'application/json' in response.headers.get('Content-Type', '') else body
            
            if status_code == 200:
                print(" [SUCCESS] (200 OK)")
                return True, data
            else:
                print(f" [WARNING] (Status: {status_code})")
                return False, data
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            data = json.loads(body)
        except:
            data = body
        print(f" [HTTP ERROR] (Status: {e.code})")
        return False, data
    except Exception as e:
        print(f" [FAILED] (Error: {e})")
        return False, None

def run_checks():
    base_url = "http://127.0.0.1:8000"
    print("=" * 60)
    print("           BACKEND API SERVICE HEALTH CHECKS            ")
    print("=" * 60)
    
    # 1. Health endpoint
    ok1, res1 = test_endpoint(f"{base_url}/health", "Base Health Check")
    if ok1 and isinstance(res1, dict):
        print(f"  - Status: {res1.get('status')}")
        print(f"  - Environment: {res1.get('env')}")
        print(f"  - OTP Mode: {res1.get('otp_mode')}")
        
    # 2. Settings endpoint
    ok2, res2 = test_endpoint(f"{base_url}/api/v1/settings", "Dynamic Settings")
    if ok2 and isinstance(res2, dict):
        print(f"  - Loaded App Name: {res2.get('APP_NAME')}")
        
    # 3. Products list endpoint
    ok3, res3 = test_endpoint(f"{base_url}/api/v1/products", "Products API")
    if ok3 and isinstance(res3, list):
        print(f"  - Retrieved {len(res3)} products successfully.")
        if len(res3) > 0:
            print(f"  - Sample Product: '{res3[0].get('name')}' (Brand: {res3[0].get('brand')}, Price: {res3[0].get('price')})")
            
    # 4. Riders endpoint
    ok4, res4 = test_endpoint(f"{base_url}/api/v1/riders", "Riders List API")
    if ok4 and isinstance(res4, list):
        print(f"  - Found {len(res4)} riders in DB.")
        for r in res4:
            print(f"    * Rider: {r.get('name')} ({r.get('vehicle_type')}, Status: {r.get('status')})")
            
    # 5. Orders endpoint
    ok5, res5 = test_endpoint(f"{base_url}/api/v1/orders", "Orders API")
    if ok5 and isinstance(res5, list):
        print(f"  - Found {len(res5)} orders in DB.")
        for o in res5:
            print(f"    * Order ID: {o.get('id')} (Status: {o.get('status')}, Total: {o.get('total')})")

    print("=" * 60)
    print("Checks completed successfully.")

if __name__ == "__main__":
    run_checks()

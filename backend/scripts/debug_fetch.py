from app.db.database import fetch_rider_by_phone

# Test the fetch function directly
phone_number = "9811223344"
rider = fetch_rider_by_phone(phone_number)

print(f"Fetching rider with phone: {phone_number}")
print(f"Result: {rider}")

if rider:
    print(f"✅ Rider found: {rider.get('name')}")
    print(f"Status: {rider.get('status')}")
    print(f"Password hash: {rider.get('password_hash')[:50]}...")
else:
    print("❌ Rider not found")

import hashlib
import secrets

# From database
stored_hash = "afcb74ea83d2679c23dd806e419df31c$268abefdeab85e70df9a3e53e2cad8b817ebf7f149820fe3d73120c5ebeb3986"
test_password = "password123"

# Verify password (from security.py)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if a plain text password matches the hashed password."""
    try:
        salt, password_hash = hashed_password.split("$")
        computed_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return secrets.compare_digest(computed_hash, password_hash)
    except Exception as e:
        print(f"Error: {e}")
        return False

result = verify_password(test_password, stored_hash)
print(f"Password verification result: {result}")
print(f"Stored hash: {stored_hash}")
print(f"Test password: {test_password}")

if result:
    print("✅ Password matches!")
else:
    print("❌ Password does not match")
    
    # Debug: show what hash would be generated
    salt, password_hash = stored_hash.split("$")
    computed_hash = hashlib.sha256((test_password + salt).encode()).hexdigest()
    print(f"Expected hash: {password_hash}")
    print(f"Computed hash: {computed_hash}")

import bcrypt

# Test password hashing and verification
password = 'admin123'

# Generate hash
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Generated hash: {password_hash}")

# Verify immediately
result = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
print(f"Immediate verification: {result}")

# Test with the hash from database
db_hash = '$2b$12$GFrkEoPx1XOI2o9Ub2ahxu8ZY5kAcDVbUKBw2LxeXj/I2JH/kzus6'
result2 = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8'))
print(f"Database hash verification: {result2}")

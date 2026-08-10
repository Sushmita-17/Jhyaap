from app.db.database import get_connection, is_postgres

conn = get_connection()
cursor = conn.cursor()

if is_postgres(conn):
    print("Connected to PostgreSQL (Supabase)")
    
    # Add missing columns to customers table
    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT")
        print("✅ Added password_hash column")
    except Exception as e:
        print(f"❌ Error adding password_hash: {e}")
    
    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT")
        print("✅ Added address column")
    except Exception as e:
        print(f"❌ Error adding address: {e}")
    
    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true")
        print("✅ Added is_active column")
    except Exception as e:
        print(f"❌ Error adding is_active: {e}")
    
    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        print("✅ Added updated_at column")
    except Exception as e:
        print(f"❌ Error adding updated_at: {e}")
    
    # Create customer_addresses table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS customer_addresses (
                id VARCHAR PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                street TEXT NOT NULL,
                landmark TEXT,
                city VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20),
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created customer_addresses table")
    except Exception as e:
        print(f"❌ Error creating customer_addresses: {e}")
    
    # Create otp_codes table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otp_codes (
                id VARCHAR PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL,
                otp_code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Created otp_codes table")
    except Exception as e:
        print(f"❌ Error creating otp_codes: {e}")
    
    # Create indexes
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number)")
        print("✅ Created idx_customers_phone_number index")
    except Exception as e:
        print(f"❌ Error creating idx_customers_phone_number: {e}")
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)")
        print("✅ Created idx_customers_email index")
    except Exception as e:
        print(f"❌ Error creating idx_customers_email: {e}")
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id)")
        print("✅ Created idx_customer_addresses_customer_id index")
    except Exception as e:
        print(f"❌ Error creating idx_customer_addresses_customer_id: {e}")
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_expires ON otp_codes(phone_number, expires_at)")
        print("✅ Created idx_otp_codes_phone_expires index")
    except Exception as e:
        print(f"❌ Error creating idx_otp_codes_phone_expires: {e}")
    
    conn.commit()
    print("\n✅ Database schema updated successfully!")
    
else:
    print("Connected to SQLite - no schema changes needed for SQLite")

cursor.close()
conn.close()

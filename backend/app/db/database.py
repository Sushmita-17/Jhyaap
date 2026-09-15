import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings

DB_DIR = Path("data")
DB_PATH = DB_DIR / "jhyaap.db"

def get_connection():
    """Return a database connection. Uses SQLite by default, PostgreSQL if configured."""
    # Use SQLite for local development to avoid PostgreSQL timeout issues
    # Set USE_POSTGRESQL=true in .env to force PostgreSQL connection
    use_postgres = getattr(settings, 'USE_POSTGRESQL', False)
    
    if use_postgres:
        try:
            db_url = settings.DATABASE_URL
            if db_url and (db_url.startswith("postgresql://") or db_url.startswith("postgres://")):
                if db_url.startswith("postgres://"):
                    db_url = db_url.replace("postgres://", "postgresql://", 1)
                
                timeout = getattr(settings, 'DB_CONNECTION_TIMEOUT', 30)
                separator = '&' if '?' in db_url else '?'
                db_url += f'{separator}connect_timeout=30&target_session_attrs=read-write'
                
                conn = psycopg2.connect(
                    db_url,
                    connect_timeout=timeout,
                    sslmode='require',
                    options="-c statement_timeout=30000"
                )
                print("PostgreSQL connection successful")
                return conn
        except Exception as e:
            print(f"PostgreSQL connection failed ({e}). Defaulting to SQLite fallback.")
    
    # Default to SQLite
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    print("Using SQLite database")
    return conn
    
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def is_postgres(conn) -> bool:
    """Returns True if the connection is a PostgreSQL connection."""
    return not hasattr(conn, "row_factory")

def get_cursor(conn):
    """Return cursor with dict-like row properties."""
    if is_postgres(conn):
        return conn.cursor(cursor_factory=RealDictCursor)
    else:
        return conn.cursor()

def init_db():
    """Initialize database tables and seed if empty."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    try:
        if is_postgres(conn):
            # PostgreSQL Table structure for products
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                brand VARCHAR,
                category VARCHAR,
                subcategory VARCHAR,
                price DOUBLE PRECISION NOT NULL,
                originalPrice DOUBLE PRECISION,
                volume VARCHAR,
                abv VARCHAR,
                image TEXT,
                rating DOUBLE PRECISION,
                reviews INTEGER,
                inStock INTEGER DEFAULT 1,
                badge VARCHAR,
                description TEXT,
                tags TEXT
            )
            """)
            
# Rider credentials table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rider_credentials (
                id VARCHAR PRIMARY KEY,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                vehicle_type VARCHAR(50),
                vehicle_number VARCHAR(50),
                status VARCHAR(20) DEFAULT 'active',
                is_admin BOOLEAN DEFAULT FALSE,
                total_earnings DOUBLE PRECISION DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            

            
            # Orders table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR PRIMARY KEY,
                order_number INTEGER,
                customer_id VARCHAR,
                rider_id VARCHAR,
                status VARCHAR(50) NOT NULL,
                items JSONB NOT NULL,
                subtotal DOUBLE PRECISION NOT NULL,
                delivery_fee DOUBLE PRECISION NOT NULL,
                tax DOUBLE PRECISION NOT NULL,
                total DOUBLE PRECISION NOT NULL,
                delivery_address TEXT NOT NULL,
                delivery_notes TEXT,
                payment_method VARCHAR(20) DEFAULT 'cod',
                payment_status VARCHAR(20) DEFAULT 'pending',
                coupon_code VARCHAR(20),
                discount_amount DOUBLE PRECISION DEFAULT 0,
                payment_screenshot TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rider_id) REFERENCES rider_credentials(id)
            )
            """)
            
            # Customer delivery ratings
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS delivery_ratings (
                order_id VARCHAR PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                rider_id VARCHAR,
                rating INTEGER NOT NULL,
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
                        # Rider earnings table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rider_earnings (
                id VARCHAR PRIMARY KEY,
                rider_id VARCHAR NOT NULL,
                order_id VARCHAR NOT NULL,
                delivery_fee DOUBLE PRECISION NOT NULL,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rider_id) REFERENCES rider_credentials(id)
            )
            """)
            
            # Customers table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id VARCHAR PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255),
                password_hash TEXT NOT NULL,
                address TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Customer addresses table
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
            
            # OTP codes table
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
            
            # Coupons table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                id VARCHAR PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                description TEXT,
                coupon_type VARCHAR(20) NOT NULL,
                value DOUBLE PRECISION NOT NULL,
                minimum_order_amount DOUBLE PRECISION DEFAULT 0,
                max_discount_amount DOUBLE PRECISION,
                usage_limit INTEGER,
                usage_count INTEGER DEFAULT 0,
                valid_from TIMESTAMP NOT NULL,
                valid_until TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Banners table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS banners (
                id VARCHAR PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                subtitle VARCHAR(200),
                image_url TEXT NOT NULL,
                cta_text VARCHAR(50),
                cta_link TEXT,
                tag VARCHAR(20),
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Categories table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                description VARCHAR(200),
                image_url TEXT,
                parent_id VARCHAR,
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Notifications table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                notification_type VARCHAR(20) NOT NULL,
                order_id VARCHAR,
                coupon_code VARCHAR(20),
                action_link TEXT,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
            """)
            
            # Admin users table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id VARCHAR PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Create indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_credentials_phone ON rider_credentials(phone_number)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider_id ON rider_earnings(rider_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_earnings_earned_at ON rider_earnings(earned_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_expires ON otp_codes(phone_number, expires_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)")
            
        else:
            # SQLite Table structure for products
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                brand TEXT,
                category TEXT,
                subcategory TEXT,
                price REAL NOT NULL,
                originalPrice REAL,
                volume TEXT,
                abv TEXT,
                image TEXT,
                rating REAL,
                reviews INTEGER,
                inStock INTEGER DEFAULT 1,
                badge TEXT,
                description TEXT,
                tags TEXT
            )
            """)
            
# Rider credentials table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rider_credentials (
                id TEXT PRIMARY KEY,
                phone_number TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                vehicle_type TEXT,
                vehicle_number TEXT,
                status TEXT DEFAULT 'active',
                is_admin INTEGER DEFAULT 0,
                total_earnings REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            

            
            # Orders table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                order_number INTEGER,
                customer_id TEXT,
                rider_id TEXT,
                status TEXT NOT NULL,
                items TEXT NOT NULL,
                subtotal REAL NOT NULL,
                delivery_fee REAL NOT NULL,
                tax REAL NOT NULL,
                total REAL NOT NULL,
                delivery_address TEXT NOT NULL,
                delivery_notes TEXT,
                payment_method TEXT DEFAULT 'cod',
                payment_status TEXT DEFAULT 'pending',
                coupon_code TEXT,
                discount_amount REAL DEFAULT 0,
                payment_screenshot TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rider_id) REFERENCES rider_credentials(id)
            )
            """)
            
            # Customer delivery ratings
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS delivery_ratings (
                order_id VARCHAR PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                rider_id VARCHAR,
                rating INTEGER NOT NULL,
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

                        # Rider earnings table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rider_earnings (
                id TEXT PRIMARY KEY,
                rider_id TEXT NOT NULL,
                order_id TEXT NOT NULL,
                delivery_fee REAL NOT NULL,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rider_id) REFERENCES rider_credentials(id)
            )
            """)
            
            # Customers table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone_number TEXT UNIQUE NOT NULL,
                email TEXT,
                password_hash TEXT NOT NULL,
                address TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Customer addresses table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS customer_addresses (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                street TEXT NOT NULL,
                landmark TEXT,
                city TEXT NOT NULL,
                postal_code TEXT,
                is_default INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
            """)
            
            # OTP codes table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS otp_codes (
                id TEXT PRIMARY KEY,
                phone_number TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Coupons table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                description TEXT,
                coupon_type TEXT NOT NULL,
                value REAL NOT NULL,
                minimum_order_amount REAL DEFAULT 0,
                max_discount_amount REAL,
                usage_limit INTEGER,
                usage_count INTEGER DEFAULT 0,
                valid_from TIMESTAMP NOT NULL,
                valid_until TIMESTAMP NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Banners table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS banners (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                subtitle TEXT,
                image_url TEXT NOT NULL,
                cta_text TEXT,
                cta_link TEXT,
                tag TEXT,
                is_active INTEGER DEFAULT 1,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Categories table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                parent_id TEXT,
                is_active INTEGER DEFAULT 1,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Notifications table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                notification_type TEXT NOT NULL,
                order_id TEXT,
                coupon_code TEXT,
                action_link TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
            """)
            
            # Admin users table (SQLite)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            
            # Create indexes for SQLite
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_credentials_phone ON rider_credentials(phone_number)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider_id ON rider_earnings(rider_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rider_earnings_earned_at ON rider_earnings(earned_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_expires ON otp_codes(phone_number, expires_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)")

        migrate_customers_table(cursor, conn)
        migrate_rider_credentials_table(cursor, conn)
        conn.commit()
        
        # Check if empty, then seed
        cursor.execute("SELECT COUNT(*) FROM products")
        row = cursor.fetchone()
        
        # Extract row count value dynamically depending on row dict/tuple format
        if isinstance(row, dict):
            cnt = list(row.values())[0] if row else 0
        elif row:
            cnt = row[0]
        else:
            cnt = 0

        if cnt == 0:
            seed_catalog(cursor, conn)
            conn.commit()
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cursor.close()
def migrate_customers_table(cursor, conn):
    """Ensure customers table has all required columns (password_hash, address, is_active, updated_at)."""
    try:
        if is_postgres(conn):
            cursor.execute("""
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            """)
        else:
            cursor.execute("PRAGMA table_info(customers)")
            rows = cursor.fetchall()
            cols = [r[1] if not isinstance(r, dict) else r['name'] for r in rows]
            if "password_hash" not in cols:
                cursor.execute("ALTER TABLE customers ADD COLUMN password_hash TEXT DEFAULT ''")
            if "address" not in cols:
                cursor.execute("ALTER TABLE customers ADD COLUMN address TEXT")
            if "is_active" not in cols:
                cursor.execute("ALTER TABLE customers ADD COLUMN is_active INTEGER DEFAULT 1")
            if "updated_at" not in cols:
                cursor.execute("ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        conn.commit()
    except Exception as e:
        print(f"Customer table migration warning: {e}")


def migrate_rider_credentials_table(cursor, conn):
    """Ensure rider_credentials table has the vehicle_number column."""
    try:
        if is_postgres(conn):
            cursor.execute("""
            ALTER TABLE rider_credentials ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(50);
            """)
        else:
            cursor.execute("PRAGMA table_info(rider_credentials)")
            rows = cursor.fetchall()
            cols = [r[1] if not isinstance(r, dict) else r['name'] for r in rows]
            if "vehicle_number" not in cols:
                cursor.execute("ALTER TABLE rider_credentials ADD COLUMN vehicle_number TEXT")
        conn.commit()
    except Exception as e:
        print(f"Rider credentials table migration warning: {e}")

def seed_catalog(cursor, conn):
    """Seed catalog database table using cheers-catalog.json data."""
    catalog_paths = [
        Path("../nightowl/src/data/cheers-catalog.json"),
        Path("nightowl/src/data/cheers-catalog.json"),
        Path("../admin/src/data/cheers-catalog.json"),
        Path("admin/src/data/cheers-catalog.json"),
    ]
    
    catalog_file = None
    for p in catalog_paths:
        if p.exists():
            catalog_file = p
            break
            
    if not catalog_file:
        print("Warning: Could not locate cheers-catalog.json file to seed database.")
        return
        
    try:
        with open(catalog_file, "r", encoding="utf-8") as f:
            products_data = json.load(f)
            
        print(f"Seeding {len(products_data)} products into database...")
        for p in products_data:
            # Inline map product keys
            mapped = {
                "id": str(p.get("id")),
                "name": str(p.get("name")),
                "brand": str(p.get("brand", "")),
                "category": str(p.get("category", "")),
                "subcategory": str(p.get("subcategory", "")),
                "price": float(p.get("price", 0)),
                "originalPrice": float(p.get("originalPrice")) if p.get("originalPrice") is not None else None,
                "volume": str(p.get("volume", "")),
                "abv": str(p.get("abv", "")),
                "image": str(p.get("image", "")),
                "rating": float(p.get("rating", 0)),
                "reviews": int(p.get("reviews", 0)),
                "inStock": 1 if p.get("inStock", True) else 0,
                "badge": p.get("badge"),
                "description": str(p.get("description", "")),
                "tags": json.dumps(p.get("tags", []))
            }
            
            if is_postgres(conn):
                cursor.execute("""
                INSERT INTO products (
                    id, name, brand, category, subcategory, price, originalPrice, 
                    volume, abv, image, rating, reviews, inStock, badge, description, tags
                ) VALUES (%(id)s, %(name)s, %(brand)s, %(category)s, %(subcategory)s, %(price)s, %(originalPrice)s, 
                          %(volume)s, %(abv)s, %(image)s, %(rating)s, %(reviews)s, %(inStock)s, %(badge)s, %(description)s, %(tags)s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    brand = EXCLUDED.brand,
                    category = EXCLUDED.category,
                    subcategory = EXCLUDED.subcategory,
                    price = EXCLUDED.price,
                    originalPrice = EXCLUDED.originalPrice,
                    volume = EXCLUDED.volume,
                    abv = EXCLUDED.abv,
                    image = EXCLUDED.image,
                    rating = EXCLUDED.rating,
                    reviews = EXCLUDED.reviews,
                    inStock = EXCLUDED.inStock,
                    badge = EXCLUDED.badge,
                    description = EXCLUDED.description,
                    tags = EXCLUDED.tags
                """, mapped)
            else:
                cursor.execute("""
                INSERT OR REPLACE INTO products (
                    id, name, brand, category, subcategory, price, originalPrice, 
                    volume, abv, image, rating, reviews, inStock, badge, description, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    mapped["id"], mapped["name"], mapped["brand"], mapped["category"], mapped["subcategory"],
                    mapped["price"], mapped["originalPrice"], mapped["volume"], mapped["abv"], mapped["image"],
                    mapped["rating"], mapped["reviews"], mapped["inStock"], mapped["badge"], mapped["description"],
                    mapped["tags"]
                ))
    except Exception as e:
        print(f"Error during seeding database: {str(e)}")

def normalize_product_dict(p: dict) -> dict:
    """Normalize database column names to match frontend/pydantic camelCase properties."""
    if "instock" in p:
        p["inStock"] = bool(p.pop("instock"))
    elif "inStock" in p:
        p["inStock"] = bool(p["inStock"])
    else:
        p["inStock"] = True
        
    if "originalprice" in p:
        p["originalPrice"] = p.pop("originalprice")
        
    return p

# Database Operations API Helpers
def fetch_all_products(category: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
    # Try Supabase client first (avoids PostgreSQL timeout issues)
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        supabase_query = supabase.table('products').select('*')
        
        if category:
            supabase_query = supabase_query.eq('category', category)
        
        if query:
            supabase_query = supabase_query.or_(f"name.ilike.%{query}%,brand.ilike.%{query}%,description.ilike.%{query}%")
        
        result = supabase_query.execute()
        if result.data:
            print(f"Fetched {len(result.data)} products from Supabase")
            products = []
            for r in result.data:
                p = normalize_product_dict(r)
                try:
                    p["tags"] = p["tags"] if isinstance(p["tags"], list) else []
                except Exception:
                    p["tags"] = []
                products.append(p)
            return products
    except Exception as e:
        print(f"Supabase fetch failed: {e}, using local database")
    
    # Fallback to local database
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM products WHERE 1=1"
    params = []
    
    if category:
        sql += " AND category = ?"
        params.append(category)
    if query:
        sql += " AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)"
        params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
        
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        products = []
        for r in rows:
            p = normalize_product_dict(dict(r))
            try:
                p["tags"] = json.loads(p["tags"]) if p["tags"] else []
            except Exception:
                p["tags"] = []
            products.append(p)
            
        return products
    except Exception as e:
        print(f"Database read error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()
    
    return []

def fetch_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    # Try Supabase client first
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        result = supabase.table('products').select('*').eq('id', product_id).execute()
        if result.data:
            p = normalize_product_dict(result.data[0])
            try:
                p["tags"] = p["tags"] if isinstance(p["tags"], list) else []
            except Exception:
                p["tags"] = []
            print(f"Fetched product {product_id} from Supabase")
            return p
    except Exception as e:
        print(f"Supabase fetch by ID failed: {e}, using local database")
    
    # Fallback to local database
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM products WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (product_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
            
        p = normalize_product_dict(dict(row))
        try:
            p["tags"] = json.loads(p["tags"]) if p["tags"] else []
        except Exception:
            p["tags"] = []
            
        return p
    except Exception as e:
        print(f"Database get ID error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def save_product(p: Dict[str, Any]) -> Dict[str, Any]:
    # Try Supabase client first
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        # Prepare data for Supabase
        mapped = {
            "id": str(p["id"]),
            "name": str(p["name"]),
            "brand": str(p.get("brand", "")),
            "category": str(p.get("category", "")),
            "subcategory": str(p.get("subcategory", "")),
            "price": float(p["price"]),
            "originalPrice": float(p["originalPrice"]) if p.get("originalPrice") is not None else None,
            "volume": str(p.get("volume", "")),
            "abv": str(p.get("abv", "")),
            "image": str(p.get("image", "")),
            "rating": float(p.get("rating", 0)),
            "reviews": int(p.get("reviews", 0)),
            "inStock": 1 if p.get("inStock", True) else 0,
            "badge": p.get("badge"),
            "description": str(p.get("description", "")),
            "tags": p.get("tags", [])
        }
        
        # Check if product exists
        existing = supabase.table('products').select('id').eq('id', mapped['id']).execute()
        
        if existing.data:
            # Update
            result = supabase.table('products').update(mapped).eq('id', mapped['id']).execute()
            print(f"Updated product {mapped['id']} in Supabase")
        else:
            # Insert
            result = supabase.table('products').insert(mapped).execute()
            print(f"Created product {mapped['id']} in Supabase")
            
        return p
    except Exception as e:
        print(f"Supabase save failed: {e}, using local database")
    
    # Fallback to local database
    conn = get_connection()
    cursor = get_cursor(conn)
    
    mapped = {
        "id": str(p["id"]),
        "name": str(p["name"]),
        "brand": str(p.get("brand", "")),
        "category": str(p.get("category", "")),
        "subcategory": str(p.get("subcategory", "")),
        "price": float(p["price"]),
        "originalPrice": float(p["originalPrice"]) if p.get("originalPrice") is not None else None,
        "volume": str(p.get("volume", "")),
        "abv": str(p.get("abv", "")),
        "image": str(p.get("image", "")),
        "rating": float(p.get("rating", 0)),
        "reviews": int(p.get("reviews", 0)),
        "inStock": 1 if p.get("inStock", True) else 0,
        "badge": p.get("badge"),
        "description": str(p.get("description", "")),
        "tags": json.dumps(p.get("tags", []))
    }
    
    try:
        if is_postgres(conn):
            cursor.execute("""
            INSERT INTO products (
                id, name, brand, category, subcategory, price, originalPrice, 
                volume, abv, image, rating, reviews, inStock, badge, description, tags
            ) VALUES (%(id)s, %(name)s, %(brand)s, %(category)s, %(subcategory)s, %(price)s, %(originalPrice)s, 
                      %(volume)s, %(abv)s, %(image)s, %(rating)s, %(reviews)s, %(inStock)s, %(badge)s, %(description)s, %(tags)s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                brand = EXCLUDED.brand,
                category = EXCLUDED.category,
                subcategory = EXCLUDED.subcategory,
                price = EXCLUDED.price,
                originalPrice = EXCLUDED.originalPrice,
                volume = EXCLUDED.volume,
                abv = EXCLUDED.abv,
                image = EXCLUDED.image,
                rating = EXCLUDED.rating,
                reviews = EXCLUDED.reviews,
                inStock = EXCLUDED.inStock,
                badge = EXCLUDED.badge,
                description = EXCLUDED.description,
                tags = EXCLUDED.tags
            """, mapped)
        else:
            cursor.execute("""
            INSERT OR REPLACE INTO products (
                id, name, brand, category, subcategory, price, originalPrice, 
                volume, abv, image, rating, reviews, inStock, badge, description, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mapped["id"], mapped["name"], mapped["brand"], mapped["category"], mapped["subcategory"],
                mapped["price"], mapped["originalPrice"], mapped["volume"], mapped["abv"], 
                mapped["image"], mapped["rating"], mapped["reviews"], mapped["inStock"], mapped["badge"], 
                mapped["description"], mapped["tags"]
            ))
        conn.commit()
        return p
    except Exception as e:
        print(f"Database save product error: {e}")
        conn.rollback()
        return p
    finally:
        cursor.close()
        conn.close()

def remove_product(product_id: str) -> bool:
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "DELETE FROM products WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (product_id,))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0
    except Exception as e:
        print(f"Database remove product error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Rider Credentials Operations
def fetch_rider_by_phone(phone_number: str) -> Optional[Dict[str, Any]]:
    """Fetch rider credentials by phone number (for authentication)."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM rider_credentials WHERE phone_number = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (phone_number,))
        row = cursor.fetchone()
        
        if not row:
            return None
            
        return dict(row)
    except Exception as e:
        print(f"Database fetch rider by phone error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def fetch_rider_by_id(rider_id: str) -> Optional[Dict[str, Any]]:
    """Fetch rider credentials by ID."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM rider_credentials WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (rider_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
            
        return dict(row)
    except Exception as e:
        print(f"Database fetch rider by ID error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def fetch_all_riders(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all riders, optionally filtered by status."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM rider_credentials WHERE 1=1"
    params = []
    
    if status:
        sql += " AND status = ?"
        params.append(status)
        
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Database fetch all riders error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def fetch_available_riders() -> List[Dict[str, Any]]:
    """Fetch riders who are available for new deliveries (active and not currently delivering)."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = """
        SELECT * FROM rider_credentials 
        WHERE status = 'active' 
        AND id NOT IN (
            SELECT DISTINCT rider_id FROM orders 
            WHERE status IN ('out_for_delivery', 'picked_up') 
            AND rider_id IS NOT NULL
        )
        ORDER BY created_at ASC
    """
    
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Database fetch available riders error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def save_rider(rider: Dict[str, Any]) -> Dict[str, Any]:
    """Create or update rider credentials."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    try:
        if is_postgres(conn):
            cursor.execute("""
            INSERT INTO rider_credentials (
                id, phone_number, password_hash, name, vehicle_type, status, is_admin, total_earnings
            ) VALUES (%(id)s, %(phone_number)s, %(password_hash)s, %(name)s, %(vehicle_type)s, %(status)s, %(is_admin)s, %(total_earnings)s)
            ON CONFLICT (phone_number) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                name = EXCLUDED.name,
                vehicle_type = EXCLUDED.vehicle_type,
                status = EXCLUDED.status,
                is_admin = EXCLUDED.is_admin,
                total_earnings = EXCLUDED.total_earnings,
                updated_at = CURRENT_TIMESTAMP
            """, rider)
        else:
            cursor.execute("""
            INSERT OR REPLACE INTO rider_credentials (
                id, phone_number, password_hash, name, vehicle_type, status, is_admin, total_earnings
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rider["id"], rider["phone_number"], rider["password_hash"],
                rider["name"], rider["vehicle_type"], rider["status"], 
                rider.get("is_admin", False), rider["total_earnings"]
            ))
        conn.commit()
        return rider
    except Exception as e:
        print(f"Database save rider error: {e}")
        conn.rollback()
        return rider
    finally:
        cursor.close()
        conn.close()

def delete_rider(rider_id: str) -> bool:
    """Delete rider credentials by ID."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "DELETE FROM rider_credentials WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (rider_id,))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0
    except Exception as e:
        print(f"Database delete rider error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Orders Operations
def fetch_orders_by_rider(rider_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch orders for a specific rider, optionally filtered by status."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM orders WHERE rider_id = ?"
    params = [rider_id]
    
    if status:
        # Handle comma-separated status values
        status_list = [s.strip() for s in status.split(',')]
        placeholders = ','.join(['?' for _ in status_list])
        sql += f" AND status IN ({placeholders})"
        params.extend(status_list)
        
    sql += " ORDER BY created_at DESC"
    
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            order = dict(row)
            # Parse JSON items field
            try:
                order["items"] = json.loads(order["items"]) if order["items"] else []
            except Exception:
                order["items"] = []
            orders.append(order)
        return orders
    except Exception as e:
        print(f"Database fetch orders by rider error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def fetch_all_orders(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all orders for the admin dashboard with customer details."""
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        sql = """
            SELECT o.*, c.name as customer_name, c.phone_number as customer_phone
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
        """
        params = []
        if status:
            sql += " WHERE o.status = ?"
            params.append(status)
        sql += " ORDER BY o.created_at DESC"
        if is_postgres(conn):
            sql = sql.replace("?", "%s")
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            order = dict(row)
            try:
                order["items"] = json.loads(order["items"]) if order.get("items") else []
            except Exception:
                order["items"] = []
            orders.append(order)
        return orders
    finally:
        cursor.close()
        conn.close()
def fetch_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    """Fetch order by ID."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM orders WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (order_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
            
        order = dict(row)
        try:
            order["items"] = json.loads(order["items"]) if order["items"] else []
        except Exception:
            order["items"] = []
        return order
    except Exception as e:
        print(f"Database fetch order by ID error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def save_order(order: Dict[str, Any]) -> Dict[str, Any]:
    """Create or update an order."""
    conn = get_connection()
    cursor = get_cursor(conn)

    # Serialize items to JSON
    items_json = json.dumps(order["items"]) if isinstance(order["items"], list) else order["items"]

    try:
        if is_postgres(conn):
            # Auto-assign order_number if not provided
            if "order_number" not in order or order["order_number"] is None:
                cursor.execute("SELECT nextval('order_number_seq')")
                order_number = cursor.fetchone()[0]
                order["order_number"] = order_number

            cursor.execute("""
            INSERT INTO orders (
                id, order_number, customer_id, rider_id, status, items, subtotal, delivery_fee,
                tax, total, delivery_address, delivery_notes, payment_method, payment_status,
                coupon_code, discount_amount, payment_screenshot
            ) VALUES (%(id)s, %(order_number)s, %(customer_id)s, %(rider_id)s, %(status)s, %(items)s,
                      %(subtotal)s, %(delivery_fee)s, %(tax)s, %(total)s, %(delivery_address)s, %(delivery_notes)s,
                      %(payment_method)s, %(payment_status)s, %(coupon_code)s, %(discount_amount)s, %(payment_screenshot)s)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                rider_id = EXCLUDED.rider_id,
                updated_at = CURRENT_TIMESTAMP
            """, {**order, "items": items_json})
        else:
            # Auto-assign order_number if not provided
            if "order_number" not in order or order["order_number"] is None:
                cursor.execute("SELECT MAX(order_number) FROM orders")
                max_num = cursor.fetchone()[0] or 0
                order["order_number"] = max_num + 1

            cursor.execute("""
            INSERT OR REPLACE INTO orders (
                id, order_number, customer_id, rider_id, status, items, subtotal, delivery_fee,
                tax, total, delivery_address, delivery_notes, payment_method, payment_status,
                coupon_code, discount_amount, payment_screenshot
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order["id"], order["order_number"], order["customer_id"], order["rider_id"], order["status"],
                items_json, order["subtotal"], order["delivery_fee"], order["tax"],
                order["total"], order["delivery_address"], order["delivery_notes"],
                order.get("payment_method", "cod"), order.get("payment_status", "pending"),
                order.get("coupon_code"), order.get("discount_amount", 0), order.get("payment_screenshot")
            ))
        conn.commit()
        return order
    except Exception as e:
        print(f"Database save order error: {e}")
        conn.rollback()
        return order
    finally:
        cursor.close()
        conn.close()

def update_order_status(order_id: str, status: str) -> bool:
    """Update order status."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, (status, order_id))
        affected = cursor.rowcount
        conn.commit()
        return affected > 0
    except Exception as e:
        print(f"Database update order status error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Earnings Operations
def fetch_earnings_by_rider(rider_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch earnings for a rider, optionally filtered by date range."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    sql = "SELECT * FROM rider_earnings WHERE rider_id = ?"
    params = [rider_id]
    
    if start_date:
        sql += " AND earned_at >= ?"
        params.append(start_date)
    if end_date:
        sql += " AND earned_at <= ?"
        params.append(end_date)
        
    sql += " ORDER BY earned_at DESC"
    
    if is_postgres(conn):
        sql = sql.replace("?", "%s")
        
    try:
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Database fetch earnings by rider error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def save_earning(earning: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new earning record."""
    conn = get_connection()
    cursor = get_cursor(conn)

def save_rider_location(location: Dict[str, Any]) -> Dict[str, Any]:
    """Save rider GPS location."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO rider_location (rider_id, latitude, longitude, heading, speed, accuracy, battery_level)
                VALUES (%(rider_id)s, %(latitude)s, %(longitude)s, %(heading)s, %(speed)s, %(accuracy)s, %(battery_level)s)
                RETURNING id, created_at
            """, location)
            row = cursor.fetchone()
            if row:
                location['id'] = row[0]
                location['created_at'] = row[1]
        else:
            import uuid
            location['id'] = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO rider_location (id, rider_id, latitude, longitude, heading, speed, accuracy, battery_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                location['id'], location['rider_id'], location['latitude'], location['longitude'],
                location.get('heading'), location.get('speed'), location.get('accuracy'), location.get('battery_level')
            ))
        
        conn.commit()
        return location
    except Exception as e:
        print(f"Database save rider location error: {e}")
        conn.rollback()
        return location
    finally:
        cursor.close()
        conn.close()

def fetch_latest_rider_location(rider_id: str) -> Optional[Dict[str, Any]]:
    """Fetch the latest location for a rider."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    try:
        sql = "SELECT * FROM rider_location WHERE rider_id = ? ORDER BY created_at DESC LIMIT 1"
        if is_postgres(conn):
            sql = sql.replace("?", "%s")
        
        cursor.execute(sql, (rider_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        if isinstance(row, dict):
            return dict(row)
        else:
            columns = [column[0] for column in cursor.description]
            return dict(zip(columns, row))
    except Exception as e:
        print(f"Database fetch rider location error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def fetch_rider_location_history(rider_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Fetch location history for a rider."""
    conn = get_connection()
    cursor = get_cursor(conn)
    
    try:
        sql = f"SELECT * FROM rider_location WHERE rider_id = ? ORDER BY created_at DESC LIMIT {limit}"
        if is_postgres(conn):
            sql = sql.replace("?", "%s")
        
        cursor.execute(sql, (rider_id,))
        rows = cursor.fetchall()
        
        if isinstance(rows, list) and len(rows) > 0 and isinstance(rows[0], dict):
            return [dict(row) for row in rows]
        else:
            columns = [column[0] for column in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        print(f"Database fetch rider location history error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def save_earning(earning: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new earning record."""
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        if is_postgres(conn):
            cursor.execute("""
            INSERT INTO rider_earnings (id, rider_id, order_id, delivery_fee)
            VALUES (%(id)s, %(rider_id)s, %(order_id)s, %(delivery_fee)s)
            """, earning)
        else:
            cursor.execute("""
            INSERT INTO rider_earnings (id, rider_id, order_id, delivery_fee)
            VALUES (?, ?, ?, ?)
            """, (earning["id"], earning["rider_id"], earning["order_id"], earning["delivery_fee"]))
        
        # Update rider total earnings
        cursor.execute("""
            UPDATE rider_credentials 
            SET total_earnings = total_earnings + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (earning["delivery_fee"], earning["rider_id"]))
        
        conn.commit()
        return earning
    except Exception as e:
        print(f"Database save earning error: {e}")
        conn.rollback()
        return earning
    finally:
        cursor.close()
        conn.close()

def save_delivery_rating(rating: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        sql = """
            INSERT INTO delivery_ratings (order_id, customer_id, rider_id, rating, review, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(order_id) DO UPDATE SET
                rating = excluded.rating,
                review = excluded.review,
                created_at = excluded.created_at
        """
        if is_postgres(conn):
            sql = sql.replace('?', '%s').replace('excluded.', 'EXCLUDED.')
        cursor.execute(sql, (
            rating['order_id'], rating['customer_id'], rating.get('rider_id'),
            rating['rating'], rating.get('review'), rating['created_at']
        ))
        conn.commit()
        return rating
    finally:
        conn.close()


def fetch_delivery_rating(order_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        placeholder = '%s' if is_postgres(conn) else '?'
        cursor.execute(f"SELECT * FROM delivery_ratings WHERE order_id = {placeholder}", (order_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()
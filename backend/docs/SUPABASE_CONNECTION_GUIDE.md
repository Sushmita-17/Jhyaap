# How to Connect Backend to Supabase Database

Since you prefer not to share sensitive credentials, here's how to manually configure your backend to connect to Supabase:

## Step 1: Get Supabase Credentials

1. **Service Role Secret Key**:
   - Go to: https://supabase.com/dashboard/project/jbibgtqxjckuaidmodvo/settings/api
   - Copy the "service_role secret" key (JWT token starting with `eyJ...`)

2. **Database URL**:
   - Go to: https://supabase.com/dashboard/project/jbibgtqxjckuaidmodvo/settings/database
   - Copy the "Connection string" from the "URI" tab
   - Format: `postgresql://postgres:[PASSWORD]@db.jbibgtqxjckuaidmodvo.supabase.co:5432/postgres`

## Step 2: Get Supabase JWT Secret

1. Go to: https://supabase.com/dashboard/project/jbibgtqxjckuaidmodvo/settings/jwt/legacy
2. Copy the "JWT Secret" (this is different from the service_role key)
3. This secret is used to validate Supabase JWT tokens

## Step 3: Update Backend .env File

Open `backend/.env` file and add/update these variables:

```env
# Supabase Configuration
SUPABASE_URL=https://jbibgtqxjckuaidmodvo.supabase.co
SUPABASE_ANON_KEY=sb_publishable_O0PkhVecSJD0OTZpUXZeVw_d7uPbp5Z
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_SECRET_KEY_HERE

# Database Configuration
DATABASE_URL=YOUR_DATABASE_URL_HERE

# Supabase JWT Configuration (optional - for Supabase auth integration)
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET_FROM_JWT_SETTINGS_HERE
SUPABASE_JWT_ISSUER=https://jbibgtqxjckuaidmodvo.supabase.co
SUPABASE_JWT_AUDIENCE=authenticated
USE_SUPABASE_JWT=false  # Set to true if using Supabase Auth

# Other existing configuration...
SECRET_KEY=development-secret-key-change-in-production-at-least-32-chars-long
APP_ENV=development
DEBUG=false
ACCESS_TOKEN_EXPIRE_MINUTES=60
REDIS_URL=redis://localhost:6379/0
FRONTEND_ORIGIN=http://localhost:5173
```

## Step 4: Create Required Tables in Supabase

Go to your Supabase SQL Editor (https://supabase.com/dashboard/project/jbibgtqxjckuaidmodvo/sql) and run these SQL commands:

```sql
-- Rider Credentials Table
CREATE TABLE IF NOT EXISTS rider_credentials (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    vehicle_type TEXT,
    status TEXT DEFAULT 'active',
    total_earnings REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    rider_id TEXT,
    status TEXT DEFAULT 'pending',
    items JSONB NOT NULL,
    total_amount REAL NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (rider_id) REFERENCES rider_credentials(id)
);

-- Rider Earnings Table
CREATE TABLE IF NOT EXISTS rider_earnings (
    id TEXT PRIMARY KEY,
    rider_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (rider_id) REFERENCES rider_credentials(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

## Step 5: Restart Backend Server

After updating the .env file, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
python -m uvicorn app.main:app --reload
```

## Step 6: Verify Connection

The backend will automatically connect to Supabase if the credentials are correct. You should see:
- ✅ "PostgreSQL connection successful" in the startup logs
- ❌ If connection fails, it will fall back to SQLite

## Step 7: Test Rider Panel

1. Open rider panel: http://localhost:3001
2. Login with credentials (you'll need to create a rider in Supabase first)
3. Or use the backend API to create a test rider:
   ```bash
   POST http://localhost:8000/api/v1/riders
   {
     "phone_number": "9811223344",
     "password": "password123",
     "name": "Test Rider",
     "vehicle_type": "Bike",
     "status": "active"
   }
   ```

## Troubleshooting

**If backend still uses SQLite:**
- Check that DATABASE_URL is correct in .env
- Verify Supabase database is accessible
- Check backend logs for connection errors

**If rider panel fails to connect:**
- Ensure backend is running on http://localhost:8000
- Check CORS configuration in backend/main.py
- Verify rider panel .env has correct backend URL

## Security Notes

- Never commit .env file to git
- Keep service_role key secret
- Use strong passwords in production
- Enable Row Level Security (RLS) in Supabase for production

# Supabase Migration Guide for Jhyaap Station

## Required Migrations (Run in Order)

### 1. Core Application Schema
**File:** `20260802_full_application_schema.sql`
**Tables Created:**
- `products` - Product catalog (whisky, vodka, wine, beer, etc.)
- `rider_credentials` - Rider accounts and authentication
- `customers` - Customer accounts and profiles
- `customer_addresses` - Customer delivery addresses
- `orders` - Order management
- `rider_earnings` - Rider earnings tracking
- `delivery_ratings` - Delivery service ratings
- `live_tracking_locations` - Real-time rider GPS tracking
- `otp_codes` - OTP verification for phone login
- `coupons` - Promo codes and discounts
- `banners` - Homepage banner ads
- `categories` - Product categories
- `notifications` - User notifications

**Indexes Created:**
- Performance indexes for products, orders, addresses, earnings, ratings, notifications, OTP, and tracking

**RLS Policies:**
- Row Level Security enabled for sensitive tables
- Service role full access policies

### 2. Additional Frontend Tables
**File:** `20260802_remaining_frontend_tables.sql`
**Tables Created:**
- `order_items` - Individual items in orders
- `payments` - Payment records and transactions
- `loyalty_accounts` - Customer loyalty points balance
- `loyalty_transactions` - Loyalty points earn/redeem history
- `product_reviews` - Customer product reviews
- `chatbot_conversations` - AI chatbot sessions
- `chatbot_messages` - Chatbot message history
- `admin_users` - Admin panel accounts
- `app_settings` - Application configuration

**Indexes Created:**
- Performance indexes for order items, payments, loyalty, reviews, and chatbot

**RLS Policies:**
- Service role full access for all tables

### 3. Banner Ads
**File:** `20260802_banner_ads.sql`
**Purpose:** Banner advertisements on homepage

### 4. Delivery Ratings
**File:** `20260802_delivery_ratings.sql`
**Purpose:** Enhanced delivery rating system

### 5. Security Hardening
**File:** `20260802_security_hardening.sql`
**Purpose:** Security policies and constraints

### 6. Missing Customer Columns
**File:** `20260805_add_missing_customer_columns.sql`
**Columns Added to customers table:**
- `loyalty_points` - Customer loyalty points balance
- `address` - Default address
- `is_active` - Account status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### 7. Payment Screenshot
**File:** `20260805_add_payment_screenshot.sql`
**Purpose:** Payment screenshot upload capability

### 8. Storage Bucket
**File:** `20260805_create_storage_bucket.sql`
**Purpose:** Storage for images (products, banners, payment screenshots)

### 9. Address Coordinates
**File:** `20260811_add_address_coordinates.sql`
**Columns Added to customer_addresses table:**
- `lat` - Latitude for GPS
- `lng` - Longitude for GPS

### 10. Order Number Sequence
**File:** `20260812_add_order_number_sequence.sql`
**Purpose:** Auto-generating order numbers

### 11. Admin Users Table
**File:** `20260812_create_admin_users_table.sql`
**Purpose:** Admin panel user management

### 12. Rider Location Table
**File:** `20260812_create_rider_location_table.sql`
**Purpose:** Enhanced rider location tracking

### 13. Delivery Fees
**File:** `20260823_delivery_fees.sql`
**Tables Created:**
- `delivery_fees` - Delivery fees by area with coordinates

**Data Inserted:**
- 100+ delivery areas across Kathmandu, Lalitpur, Bhaktapur
- Zone-based pricing (A: 80 NPR, C: 120 NPR, D: 150 NPR)
- ETA times per area
- GPS coordinates for each area

**Features:**
- Auto-update timestamp trigger
- Performance indexes
- Admin-manageable fees

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Run migrations in the order listed above
5. Verify tables are created in Table Editor

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### Option 3: Direct SQL Execution
```bash
# Using psql
psql -h db.jbibgtqxjckuaidmodvo.supabase.co -U postgres -d postgres -f 20260802_full_application_schema.sql
psql -h db.jbibgtqxjckuaidmodvo.supabase.co -U postgres -d postgres -f 20260802_remaining_frontend_tables.sql
# ... continue for all files
```

## Post-Migration Setup

### 1. Create Storage Buckets
After running `20260805_create_storage_bucket.sql`, create these buckets in Supabase Storage:
- `products` - Product images
- `banners` - Banner images
- `payments` - Payment screenshots
- `avatars` - User profile pictures

### 2. Set Up RLS Policies
The migrations include basic RLS policies. You may need to add:
- Customer-specific policies for customers table
- Rider-specific policies for rider tables
- Admin-specific policies for admin tables

### 3. Insert Initial Data
**Products:** Insert your product catalog
**Coupons:** Insert initial promo codes (JHYAAP20, FIRST100, DELIVERY50)
**Admin Users:** Create admin account
**Categories:** Set up product categories

### 4. Configure Environment Variables
Update your backend `.env` file with Supabase credentials:
```
SUPABASE_URL=https://db.jbibgtqxjckuaidmodvo.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Verification Checklist

After running all migrations, verify:

- [ ] All tables created in Table Editor
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Triggers working (updated_at columns)
- [ ] Delivery fees data populated (100+ areas)
- [ ] Backend can connect to database
- [ ] Frontend can fetch data

## Web App Functionality (No PWA/APK)

The web app will work fully without PWA/APK. Users can:
- Access via browser on any device
- Browse products and place orders
- Track orders in real-time
- Use AI chatbot
- Manage loyalty points
- View order history

PWA features are optional enhancements for mobile experience but not required for core functionality.

## Troubleshooting

**Migration Errors:**
- Check if table already exists (migrations use IF NOT EXISTS)
- Verify Supabase project is active
- Check database permissions

**Missing Data:**
- Delivery fees should auto-populate 100+ areas
- Products need manual insertion
- Admin users need manual creation

**Connection Issues:**
- Verify Supabase URL and keys
- Check network connectivity
- Ensure backend is running

## Support

For issues with specific migrations, check the migration file comments or refer to Supabase documentation.

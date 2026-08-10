# Supabase Database Setup Guide

This guide covers setting up all necessary tables and Row-Level Security policies for the Jhyaap Station Rider Panel.

## 1. Create Tables

Run these SQL queries in your Supabase SQL editor.

### 1.1 Riders Table

```sql
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_riders_user_id ON riders(user_id);
CREATE INDEX idx_riders_phone_number ON riders(phone_number);

-- Enable Row-Level Security
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
```

### 1.2 Customers Table

```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_phone_number ON customers(phone_number);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### 1.3 Addresses Table

```sql
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  street VARCHAR(255) NOT NULL,
  landmark VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
```

### 1.4 Products Table

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### 1.5 Orders Table

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_staff_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'pending',
    -- Valid statuses: pending, accepted, preparing, out_for_delivery, delivered, cancelled
  delivery_notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_delivery_staff_id ON orders(delivery_staff_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### 1.6 Order Items Table

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

### 1.7 Rider Earnings Table (NEW)

```sql
CREATE TABLE IF NOT EXISTS rider_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rider_earnings_rider_id ON rider_earnings(rider_id);
CREATE INDEX idx_rider_earnings_earned_at ON rider_earnings(earned_at);
CREATE INDEX idx_rider_earnings_order_id ON rider_earnings(order_id);

ALTER TABLE rider_earnings ENABLE ROW LEVEL SECURITY;
```

## 2. Row-Level Security (RLS) Policies

These policies ensure riders can only access their own data.

### 2.1 Riders Policies

```sql
-- Riders can view their own profile
CREATE POLICY "Riders can view own profile"
  ON riders FOR SELECT
  USING (auth.uid() = user_id);

-- Riders can update their own profile
CREATE POLICY "Riders can update own profile"
  ON riders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2.2 Orders Policies

```sql
-- Riders can view orders assigned to them
CREATE POLICY "Riders view own orders"
  ON orders FOR SELECT
  USING (delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid()));

-- Riders can update status of orders assigned to them
CREATE POLICY "Riders update own orders"
  ON orders FOR UPDATE
  USING (delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid()))
  WITH CHECK (delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid()));
```

### 2.3 Order Items Policies

```sql
-- Riders can view items in their own orders
CREATE POLICY "Riders view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid())
    )
  );
```

### 2.4 Addresses Policies

```sql
-- Riders can view addresses of their orders
CREATE POLICY "Riders view addresses of own orders"
  ON addresses FOR SELECT
  USING (
    id IN (
      SELECT address_id FROM orders 
      WHERE delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid())
    )
  );
```

### 2.5 Products Policies

```sql
-- All authenticated users can view products
CREATE POLICY "Authenticated users view products"
  ON products FOR SELECT
  USING (true);
```

### 2.6 Customers Policies

```sql
-- Riders can view customers of their orders
CREATE POLICY "Riders view customers of own orders"
  ON customers FOR SELECT
  USING (
    id IN (
      SELECT customer_id FROM orders 
      WHERE delivery_staff_id = (SELECT id FROM riders WHERE user_id = auth.uid())
    )
  );
```

### 2.7 Rider Earnings Policies

```sql
-- Riders can view their own earnings
CREATE POLICY "Riders view own earnings"
  ON rider_earnings FOR SELECT
  USING (rider_id = (SELECT id FROM riders WHERE user_id = auth.uid()));

-- System/backend can insert earnings (insert-only from app)
CREATE POLICY "Insert earnings for own deliveries"
  ON rider_earnings FOR INSERT
  WITH CHECK (rider_id = (SELECT id FROM riders WHERE user_id = auth.uid()));
```

## 3. Enable Phone Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Phone** provider
3. Configure your SMS provider (Twilio recommended)
4. Test with a phone number

## 4. Sample Test Data (Optional)

Use these queries to add test data for development:

```sql
-- Insert test rider (replace with real user ID from auth.users)
INSERT INTO riders (user_id, phone_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Replace with actual user ID
  '+977 9800000000',
  'Test Rider'
);

-- Insert test customer
INSERT INTO customers (phone_number, name)
VALUES ('+977 9811111111', 'Test Customer')
RETURNING id;

-- Insert test address (replace customer_id)
INSERT INTO addresses (customer_id, street, landmark)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Replace with actual customer ID
  'Thamel, Kathmandu',
  'Near Stupa'
)
RETURNING id;

-- Insert test products
INSERT INTO products (name, price, category)
VALUES
  ('Momos (6 pcs)', 250.00, 'food'),
  ('Chowmein', 200.00, 'food'),
  ('Thakali Khana', 350.00, 'food');

-- Insert test order (replace IDs)
INSERT INTO orders (delivery_staff_id, customer_id, address_id, status, subtotal, delivery_fee, tax, total)
VALUES (
  '00000000-0000-0000-0000-000000000002',  -- Replace with rider ID
  '00000000-0000-0000-0000-000000000001',  -- Replace with customer ID
  '00000000-0000-0000-0000-000000000003',  -- Replace with address ID
  'out_for_delivery',
  700.00,
  50.00,
  70.00,
  820.00
)
RETURNING id;
```

## 5. Verification Checklist

- [ ] All tables created successfully
- [ ] RLS enabled on all tables
- [ ] All RLS policies created
- [ ] Phone authentication enabled
- [ ] SMS provider configured
- [ ] Test login works with OTP
- [ ] Rider can see their own orders
- [ ] Rider can see their own earnings
- [ ] Earnings are logged when order marked as delivered

## 6. Troubleshooting

### Issue: "Rows not visible" or empty results
- **Solution**: Check RLS policies are correct and enabled
- Run: `SELECT * FROM orders;` with authenticated rider user

### Issue: "Permission denied" errors
- **Solution**: Verify user_id in auth.users matches riders.user_id
- Check the RLS policy WHERE clauses match the user context

### Issue: OTP not working
- **Solution**: Verify phone number format is exactly `+977XXXXXXXXXX`
- Check SMS provider configuration in Supabase Auth settings

### Issue: Earnings not logging
- **Solution**: Ensure rider_id and order_id are correct UUIDs
- Verify rider_id from riders table matches current user

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Phone Auth](https://supabase.com/docs/guides/auth/phone-login)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

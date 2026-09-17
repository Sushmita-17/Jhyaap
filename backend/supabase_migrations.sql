-- Supabase Migrations for Jhyaap Station
-- Run these in Supabase SQL Editor to update the database schema

-- Migration 1: Add order_number column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Migration 2: Create sequence for order_number
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Migration 3: Update existing orders without order_number
-- This assigns sequential numbers to existing orders
DO $$
DECLARE
    max_num INTEGER;
    order_record RECORD;
BEGIN
    -- Get current max order number (cast to integer to handle type mismatch)
    SELECT COALESCE(MAX(CAST(order_number AS INTEGER)), 0) INTO max_num FROM orders;
    
    -- Update orders without order_number
    FOR order_record IN 
        SELECT id FROM orders WHERE order_number IS NULL OR CAST(order_number AS INTEGER) = 0
    LOOP
        max_num := max_num + 1;
        UPDATE orders SET order_number = max_num::TEXT WHERE id = order_record.id;
        RAISE NOTICE 'Updated order % to order_number %', order_record.id, max_num;
    END LOOP;
END $$;

-- Migration 4: Add index on order_number for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Migration 5: Ensure customers table has all required columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migration 6: Add indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Migration 7: Add indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Verify the migration
SELECT 
    'orders table has order_number column' as check_result,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'order_number';

SELECT 
    'orders with order_number assigned' as check_result,
    COUNT(*) as count
FROM orders 
WHERE order_number IS NOT NULL AND CAST(order_number AS INTEGER) > 0;

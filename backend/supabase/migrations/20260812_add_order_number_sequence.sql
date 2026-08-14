-- Add order_number column and sequence for sequential order IDs
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Create sequence for order numbers starting from 100
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 100;

-- Set default value for new orders
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT nextval('public.order_number_seq');

-- Populate existing orders with sequential numbers
UPDATE public.orders SET order_number = nextval('public.order_number_seq') WHERE order_number IS NULL;

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

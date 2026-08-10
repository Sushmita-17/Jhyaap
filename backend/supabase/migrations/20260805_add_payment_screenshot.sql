-- Add payment_screenshot column to orders table
-- This stores the path/URL to the payment screenshot for eSewa and Khalti payments

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN orders.payment_screenshot IS 'Path or URL to payment screenshot for eSewa/Khalti verification';

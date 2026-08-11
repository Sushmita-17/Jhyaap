-- Add latitude and longitude columns to customer_addresses table
-- This migration adds coordinate storage for precise location tracking

ALTER TABLE public.customer_addresses 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_url TEXT;

-- Add index for faster coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_customer_addresses_coordinates 
ON public.customer_addresses(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

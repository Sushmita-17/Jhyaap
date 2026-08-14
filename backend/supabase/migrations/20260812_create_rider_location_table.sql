-- Create rider_location table for real-time GPS tracking
CREATE TABLE IF NOT EXISTS public.rider_location (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  battery_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT fk_rider FOREIGN KEY (rider_id) REFERENCES public.rider_credentials(id) ON DELETE CASCADE
);

-- Create index on rider_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_rider_location_rider_id ON public.rider_location(rider_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_rider_location_created_at ON public.rider_location(created_at DESC);

-- Enable RLS
ALTER TABLE public.rider_location ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to have full access
DROP POLICY IF EXISTS "service role full access rider_location" ON public.rider_location;
CREATE POLICY "service role full access rider_location" ON public.rider_location FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create policy for riders to insert their own location
DROP POLICY IF EXISTS "rider insert own location" ON public.rider_location;
CREATE POLICY "rider insert own location" ON public.rider_location FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rider_credentials 
    WHERE id = rider_id AND user_id = auth.uid()
  )
);

-- Create policy for riders to view their own location history
DROP POLICY IF EXISTS "rider view own location" ON public.rider_location;
CREATE POLICY "rider view own location" ON public.rider_location FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rider_credentials 
    WHERE id = rider_id AND user_id = auth.uid()
  )
);

-- Create policy for admins to view all rider locations
DROP POLICY IF EXISTS "admin view all locations" ON public.rider_location;
CREATE POLICY "admin view all locations" ON public.rider_location FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

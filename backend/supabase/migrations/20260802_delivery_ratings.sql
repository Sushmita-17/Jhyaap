-- Delivery ratings: one customer rating per completed order.
CREATE TABLE IF NOT EXISTS public.delivery_ratings (
  order_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  rider_id TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT CHECK (review IS NULL OR char_length(review) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_ratings_customer_id
  ON public.delivery_ratings (customer_id);

CREATE INDEX IF NOT EXISTS idx_delivery_ratings_rider_id
  ON public.delivery_ratings (rider_id);

CREATE INDEX IF NOT EXISTS idx_delivery_ratings_created_at
  ON public.delivery_ratings (created_at DESC);

-- The backend uses the service-role connection for writes, so RLS prevents
-- accidental direct public access while allowing backend operations.
ALTER TABLE public.delivery_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery ratings service role access" ON public.delivery_ratings;
CREATE POLICY "delivery ratings service role access"
  ON public.delivery_ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Safe repeated submission for the same order.
CREATE OR REPLACE FUNCTION public.upsert_delivery_rating(
  p_order_id TEXT,
  p_customer_id TEXT,
  p_rider_id TEXT,
  p_rating SMALLINT,
  p_review TEXT
)
RETURNS public.delivery_ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result public.delivery_ratings;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  INSERT INTO public.delivery_ratings (order_id, customer_id, rider_id, rating, review)
  VALUES (p_order_id, p_customer_id, p_rider_id, p_rating, p_review)
  ON CONFLICT (order_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    review = EXCLUDED.review,
    rider_id = EXCLUDED.rider_id,
    created_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;
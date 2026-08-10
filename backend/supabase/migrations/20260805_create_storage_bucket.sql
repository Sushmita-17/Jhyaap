-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Grant public access to read images from the bucket
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Grant authenticated users upload access
CREATE POLICY "Authenticated upload access for product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Grant authenticated users update access
CREATE POLICY "Authenticated update access for product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Grant authenticated users delete access
CREATE POLICY "Authenticated delete access for product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

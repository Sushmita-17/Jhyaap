-- Jhyaap Station security hardening
-- The backend uses the Supabase service role. Keep all browser access behind
-- authenticated FastAPI endpoints; never expose the service-role key.

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customers', 'orders', 'order_items', 'payments',
    'coupons', 'notifications', 'otp_codes', 'live_tracking_locations',
    'delivery_ratings', 'loyalty_accounts', 'loyalty_transactions',
    'product_reviews', 'chatbot_conversations', 'chatbot_messages',
    'admin_users', 'app_settings', 'banners', 'categories', 'products'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('DROP POLICY IF EXISTS "service role only %s" ON public.%I', table_name, table_name);
      EXECUTE format(
        'CREATE POLICY "service role only %s" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        table_name, table_name
      );
    END IF;
  END LOOP;
END $$;

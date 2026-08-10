ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS placement TEXT NOT NULL DEFAULT 'hero'
    CHECK (placement IN ('hero', 'popup')),
  ADD COLUMN IF NOT EXISTS dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS skip_text TEXT DEFAULT 'Skip offer',
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_banners_placement_active
  ON public.banners(placement, is_active);

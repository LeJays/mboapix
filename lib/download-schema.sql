CREATE TABLE IF NOT EXISTS public.gallery_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_id uuid NULL REFERENCES public.gallery_photos(id) ON DELETE SET NULL,
  media_type text NOT NULL CHECK (media_type IN ('gallery', 'photo', 'video')),
  file_name text,
  file_url text,
  viewer_name text,
  viewer_email text,
  viewer_key text,
  viewer_user_id uuid NULL REFERENCES public.profiles(id),
  viewer_ip text,
  user_agent text,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gallery_downloads_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS gallery_downloads_gallery_id_idx
  ON public.gallery_downloads (gallery_id);

CREATE INDEX IF NOT EXISTS gallery_downloads_downloaded_at_idx
  ON public.gallery_downloads (downloaded_at DESC);

CREATE TABLE IF NOT EXISTS public.gallery_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_id uuid NULL REFERENCES public.gallery_photos(id) ON DELETE SET NULL,
  item_name text,
  item_type text NOT NULL DEFAULT 'photo' CHECK (item_type IN ('gallery', 'photo', 'video')),
  viewer_name text,
  viewer_email text,
  viewer_key text,
  viewer_user_id uuid NULL REFERENCES public.profiles(id),
  viewer_ip text,
  user_agent text,
  favorited_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gallery_favorites_pkey PRIMARY KEY (id)
);

ALTER TABLE public.gallery_downloads
  ADD COLUMN IF NOT EXISTS viewer_key text;

ALTER TABLE public.gallery_favorites
  ADD COLUMN IF NOT EXISTS viewer_key text;

ALTER TABLE public.gallery_visitors
  ADD COLUMN IF NOT EXISTS viewer_key text;

CREATE INDEX IF NOT EXISTS gallery_favorites_gallery_id_idx
  ON public.gallery_favorites (gallery_id);

CREATE INDEX IF NOT EXISTS gallery_favorites_favorited_at_idx
  ON public.gallery_favorites (favorited_at DESC);

CREATE TABLE IF NOT EXISTS public.gallery_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  viewer_email text NOT NULL,
  viewer_key text NOT NULL,
  viewer_name text,
  viewer_user_id uuid NULL REFERENCES public.profiles(id),
  viewer_ip text,
  user_agent text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gallery_visitors_pkey PRIMARY KEY (id),
  CONSTRAINT gallery_visitors_gallery_key_unique UNIQUE (gallery_id, viewer_key)
);

CREATE INDEX IF NOT EXISTS gallery_visitors_gallery_id_idx
  ON public.gallery_visitors (gallery_id);

CREATE INDEX IF NOT EXISTS gallery_visitors_last_seen_idx
  ON public.gallery_visitors (last_seen_at DESC);

ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'photo'
  CHECK (media_type IN ('photo', 'video'));

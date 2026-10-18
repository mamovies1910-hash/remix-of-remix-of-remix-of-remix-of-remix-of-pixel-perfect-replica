CREATE TABLE public.firebase_identity_links (
 firebase_uid text PRIMARY KEY,
 user_id uuid NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.firebase_identity_links TO service_role;
ALTER TABLE public.firebase_identity_links ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.firebase_identity_links IS 'Server-only verified Firebase identity to Cloud account mapping. No browser access.';

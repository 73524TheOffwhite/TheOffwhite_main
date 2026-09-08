-- Instagram Graph API token storage for homepage feed auto-refresh.
-- Service role only (no anon/authenticated policies). Run via Supabase SQL / CLI.
--
-- After deploy, schedule daily refresh (Supabase Dashboard → Edge Functions → Cron):
--   POST /functions/v1/refresh-instagram-token
--   Header: Authorization: Bearer <INSTAGRAM_CRON_SECRET or service_role key>
--   Body: { "action": "refresh" }
--
-- Seed a fresh token once (after Meta permissions):
--   Body: { "action": "upsert", "access_token": "<token>", "instagram_user_id": "<optional>", "username": "offwhitegoa" }

BEGIN;

CREATE TABLE IF NOT EXISTS public.instagram_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT 'default',
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'facebook_user'
    CHECK (token_type IN ('facebook_user', 'instagram_user', 'page')),
  instagram_user_id TEXT,
  username TEXT,
  expires_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_tokens_label_unique UNIQUE (label)
);

CREATE INDEX IF NOT EXISTS instagram_tokens_expires_at_idx
  ON public.instagram_tokens (expires_at);

ALTER TABLE public.instagram_tokens ENABLE ROW LEVEL SECURITY;

-- Intentionally no GRANT/policies for anon or authenticated.
-- Only service_role (bypasses RLS) may read/write tokens.

COMMIT;

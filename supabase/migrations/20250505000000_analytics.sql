-- Analytics: visitor sessions and page views
-- Run this in your Supabase SQL editor or via the CLI

-- ----------------------------------------------------------------
-- visitor_sessions
-- One row per browser session (sessionStorage-scoped)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT        NOT NULL UNIQUE,
  first_page      TEXT        NOT NULL DEFAULT '/',
  referrer        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  device_type     TEXT        NOT NULL DEFAULT 'Desktop',
  browser         TEXT        NOT NULL DEFAULT 'Other',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- page_views
-- One row per page visit within a session
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_views (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT        NOT NULL,
  page             TEXT        NOT NULL,
  referrer         TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vs_created_at   ON public.visitor_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vs_session_id   ON public.visitor_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_pv_created_at   ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_session_id   ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_pv_page         ON public.page_views (page);

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views       ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT (tracking from public website)
CREATE POLICY "anon_insert_sessions" ON public.visitor_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_insert_views" ON public.page_views
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can UPDATE (update last_active_at and duration_seconds)
CREATE POLICY "anon_update_sessions" ON public.visitor_sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_update_views" ON public.page_views
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Authenticated (admin) has full access
CREATE POLICY "auth_all_sessions" ON public.visitor_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_views" ON public.page_views
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Form submissions from the contact/inquiry form
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  company       TEXT,
  role          TEXT,
  inquiry_type  TEXT        NOT NULL,
  message       TEXT        NOT NULL,
  source        TEXT        NOT NULL DEFAULT 'kivaro-ai-website',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exported      BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fs_created_at    ON public.form_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fs_email         ON public.form_submissions (email);
CREATE INDEX IF NOT EXISTS idx_fs_inquiry_type  ON public.form_submissions (inquiry_type);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT (public contact form)
CREATE POLICY "anon_insert_submissions" ON public.form_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated (admin) has full access
CREATE POLICY "auth_all_submissions" ON public.form_submissions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

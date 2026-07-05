-- ============================================================
-- PulseFeed Waitlist Table — run in Supabase SQL Editor
-- ============================================================

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: allow INSERT only from the service (anon key via backend)
-- No SELECT/UPDATE/DELETE from anon users — only service_role can read
CREATE POLICY "Allow backend insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Deny all reads from anon (only you can read via Supabase dashboard or service_role key)
CREATE POLICY "Deny anon select" ON waitlist
  FOR SELECT
  USING (false);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

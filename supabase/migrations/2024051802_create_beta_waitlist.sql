-- Create Beta Waitlist Table
CREATE TABLE IF NOT EXISTS beta_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- RLS: Only allow insertions from public, only allow admin (service_role) to read
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public signups" ON beta_waitlist FOR INSERT WITH CHECK (true);

-- Add XP and Level columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Function to handle XP gains (e.g., call after order completion)
CREATE OR REPLACE FUNCTION add_driver_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET xp = xp + amount,
      level = floor((xp + amount) / 1000) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

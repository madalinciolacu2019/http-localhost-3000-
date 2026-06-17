-- Add VIP tier tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;

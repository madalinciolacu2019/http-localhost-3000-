-- Initial Business App Schema
-- Handles Products, Orders, Users, F1 Drivers, Teams, and Tracks

-- Enable pgcrypto for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- USERS & PROFILES
-- ==========================================
-- profiles table typically created automatically via trigger on auth.users in Supabase, 
-- but let's define it to be safe.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  driver_rank TEXT DEFAULT 'Rookie',
  credits INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- PRODUCTS & INVENTORY
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  stock_count INTEGER DEFAULT 100,
  category TEXT NOT NULL,
  stats JSONB, -- e.g., {"intensity": "98%", "heat": "92°C"}
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products." ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- ORDERS & ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'completed', 'cancelled'
  total_amount DECIMAL(10, 2) NOT NULL,
  stripe_session_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders." ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items." ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items." ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage order items." ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- F1 TEAMS & DRIVERS
-- ==========================================
CREATE TABLE IF NOT EXISTS f1_teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  chassis TEXT,
  power_unit TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE f1_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "F1 Teams are viewable by everyone." ON f1_teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams." ON f1_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE TABLE IF NOT EXISTS f1_drivers (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES f1_teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  number INTEGER,
  nationality TEXT,
  portrait_url TEXT,
  biography TEXT,
  points INTEGER DEFAULT 0,
  podiums INTEGER DEFAULT 0,
  championships INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE f1_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "F1 Drivers are viewable by everyone." ON f1_drivers FOR SELECT USING (true);
CREATE POLICY "Admins can manage drivers." ON f1_drivers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- TRACKS
-- ==========================================
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  layout_url TEXT,
  length_km DECIMAL(5, 3),
  laps INTEGER,
  lap_record TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks are viewable by everyone." ON tracks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tracks." ON tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Insert Initial Sample Data
INSERT INTO products (name, description, price, image, category, stats, color) VALUES
('DRS Espresso', 'High-speed caffeine kick for maximum overtake potential.', 4.5, '/menu_espresso_turbo.png', 'Espresso', '{"intensity": "98%", "heat": "92°C"}', 'red'),
('Apex Latte', 'Smooth transition from milk to coffee. Perfectly balanced.', 5.5, '/menu_latte_apex.png', 'Milk Based', '{"intensity": "75%", "heat": "85°C"}', 'yellow'),
('Full Wet Cold Brew', '18-hour slow infusion for maximum grip on long straights.', 6.0, '/menu_cold_brew_wet.png', 'Iced', '{"intensity": "85%", "heat": "4°C"}', 'blue')
ON CONFLICT DO NOTHING;

-- Business Readiness Extensions Migration
-- Adds Simulator bookings, Telemetry sync, Inventory control, Loyalty points, and Legal consent tables

-- ==========================================
-- 1. SIMULATOR RIGS
-- ==========================================
CREATE TABLE IF NOT EXISTS simulator_rigs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'motion', 'direct-drive', 'vr'
  status TEXT DEFAULT 'active', -- 'active', 'maintenance', 'offline'
  hourly_rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE simulator_rigs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Simulator rigs are viewable by everyone" ON simulator_rigs FOR SELECT USING (true);
CREATE POLICY "Admins can manage rigs" ON simulator_rigs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- 2. BOOKINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rig_id INTEGER REFERENCES simulator_rigs(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- 3. TELEMETRY LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rig_id INTEGER REFERENCES simulator_rigs(id) ON DELETE SET NULL,
  track_name TEXT NOT NULL,
  car_name TEXT NOT NULL,
  lap_time_ms INTEGER NOT NULL,
  sector_1_ms INTEGER,
  sector_2_ms INTEGER,
  sector_3_ms INTEGER,
  max_speed_kmh DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Telemetry is viewable by everyone" ON telemetry_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own telemetry" ON telemetry_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all telemetry" ON telemetry_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- 4. INVENTORY STOCK
-- ==========================================
CREATE TABLE IF NOT EXISTS inventory_stock (
  id SERIAL PRIMARY KEY,
  ingredient_name TEXT UNIQUE NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, -- 'g', 'L', 'units'
  warning_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory is viewable by staff and admins" ON inventory_stock FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'staff'))
);
CREATE POLICY "Admins and staff can manage inventory" ON inventory_stock FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'staff'))
);

-- ==========================================
-- 5. LOYALTY TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points_change INTEGER NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'earn', 'redeem', 'bonus'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own loyalty history" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage loyalty" ON loyalty_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- 6. LEGAL CONSENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS legal_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL, -- 'cookie_consent', 'liability_waiver'
  ip_address TEXT,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own consents" ON legal_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own consents" ON legal_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view consents" ON legal_consents FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- SEED SAMPLE DATA
-- ==========================================
INSERT INTO simulator_rigs (name, type, hourly_rate) VALUES
('Bay 1: Apex Motion Rig', 'motion', 45.00),
('Bay 2: Fanatec Direct Drive', 'direct-drive', 30.00),
('Bay 3: VR G-Force Pod', 'vr', 35.00)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_stock (ingredient_name, current_stock, unit, warning_threshold) VALUES
('DRS Espresso beans', 1500, 'g', 300),
('Apex Milk', 20, 'L', 5),
('Cold Brew Concentrate', 30, 'L', 8),
('Biodegradable Cups', 500, 'units', 100)
ON CONFLICT (ingredient_name) DO NOTHING;

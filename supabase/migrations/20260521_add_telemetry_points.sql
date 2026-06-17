-- Migration to add telemetry_points to profiles for the Paddock Club
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telemetry_points integer DEFAULT 0;

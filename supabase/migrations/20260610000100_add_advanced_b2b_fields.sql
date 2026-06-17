-- Migration: Add Advanced B2B fields J-Code, IBAN, and Bank
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS billing_j    TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_iban TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_bank TEXT DEFAULT NULL;

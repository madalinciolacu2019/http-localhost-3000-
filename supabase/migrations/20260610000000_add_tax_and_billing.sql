-- Migration: Add Tax Compliance & B2B Invoicing fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS net_amount      DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS vat_rate        DECIMAL(5, 4)  DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS vat_amount      DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS billing_name    TEXT           DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_address JSONB          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_cui     TEXT           DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS invoice_number  TEXT           DEFAULT NULL;

-- Create index on invoice number for fast invoice queries
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number
  ON orders (invoice_number)
  WHERE invoice_number IS NOT NULL;

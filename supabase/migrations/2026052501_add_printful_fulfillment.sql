-- ============================================================
-- Migration: Add Printful fulfillment fields to orders table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Add Printful order tracking columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS printful_order_id    TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fulfillment_status   TEXT    DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS tracking_number      TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tracking_url         TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fulfillment_method   TEXT    DEFAULT 'counter',
  ADD COLUMN IF NOT EXISTS customer_name        TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_email       TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_phone       TEXT    DEFAULT NULL;

-- Add size column to order_items (needed for apparel)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS size             TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_name     TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_category TEXT    DEFAULT NULL;

-- Index for fast fulfillment status lookups
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status
  ON orders (fulfillment_status);

CREATE INDEX IF NOT EXISTS idx_orders_printful_order_id
  ON orders (printful_order_id)
  WHERE printful_order_id IS NOT NULL;

-- Fulfillment status values reference:
--   'not_required'      — coffee-only order, no physical merch
--   'pending'           — merch order, Printful call not yet made
--   'sandbox'           — Printful API key not configured, skipped
--   'draft'             — Printful order created as draft
--   'pending'           — Printful order confirmed, awaiting fulfillment
--   'inprocess'         — Printful is manufacturing the item
--   'fulfilled'         — Printful has shipped the order
--   'shipped'           — Order dispatched, tracking available
--   'fulfillment_error' — Printful API call failed
--   'canceled'          — Order or fulfillment canceled

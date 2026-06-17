-- Migration: Enable Row Level Security (RLS) on core tables

-- 1. Orders Table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own orders (or guest orders if user_id is null)
CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to read only their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update only their own profile
CREATE POLICY "Users can view and update their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id);

-- 3. Order Items Table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Since order items belong to an order, we can check the parent order's ownership
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

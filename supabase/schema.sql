-- schema.sql
-- Run this script in the Supabase SQL Editor to create tables for KopiKasir

-- ============================================================================
-- 1. Users Profile (Extending auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cashier', 'supervisor', 'owner')),
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Products
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  description TEXT,
  image TEXT,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_temperature BOOLEAN DEFAULT false,
  has_sugar_level BOOLEAN DEFAULT false,
  has_milk_type BOOLEAN DEFAULT false,
  available_modifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  recipe JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Inventory (Stock Items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  minimum_stock NUMERIC NOT NULL DEFAULT 0,
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Customers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  favorite_items JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. Shifts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  user_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  opening_cash NUMERIC NOT NULL,
  closing_cash NUMERIC,
  total_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- 7. Orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  type TEXT NOT NULL,
  table_number INTEGER,
  status TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  discount_label TEXT,
  tax NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  cashier_id UUID NOT NULL REFERENCES public.users(id),
  cashier_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- RLS (Row Level Security) - Optional if you want to secure tables
-- ============================================================================
-- Disable RLS temporarily to allow frontend direct access without policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Permissions (Wajib dijalankan agar API bisa membaca tabel)
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Insert Mock Users (Important for the first login)
-- Note: Replace these with proper Supabase Auth sign-ups later.
-- INSERT INTO auth.users ... (done via API or UI usually)

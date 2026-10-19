-- ==============================================================================
-- REUNITE-AI: LOST & FOUND AI RECOVERY & DELIVERY ECOSYSTEM
-- Supabase PostgreSQL Schema with Row-Level Security, Indexes, and Constraints
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'courier', 'admin')),
  finder_discount_tokens INT DEFAULT 0 CHECK (finder_discount_tokens >= 0),
  items_reported_lost INT DEFAULT 0,
  items_reported_found INT DEFAULT 0,
  successful_reunions INT DEFAULT 0,
  courier_wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
  courier_deliveries_completed INT DEFAULT 0,
  courier_rating NUMERIC(3, 2) DEFAULT 5.00,
  saved_shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Items (Lost & Found) Table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY DEFAULT ('item_' || uuid_generate_v4()::text),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'smartphone', 'earbuds', 'laptop', 'wallet', 'keys',
    'smartwatch', 'documents', 'jewelry', 'bag', 'other'
  )),
  brand TEXT,
  model TEXT,
  color TEXT,
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  location_address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  date_reported TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  shipping_address TEXT,
  secret_verification_hint TEXT,
  status TEXT DEFAULT 'reported' CHECK (status IN (
    'reported', 'matched', 'shipping_paid', 'courier_assigned',
    'picked_up', 'in_transit', 'delivered', 'resolved'
  )),
  matched_with_id TEXT,
  delivery_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. AI Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY DEFAULT ('match_' || uuid_generate_v4()::text),
  lost_item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  found_item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  confidence_score INT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  visual_similarity INT NOT NULL CHECK (visual_similarity BETWEEN 0 AND 100),
  text_similarity INT NOT NULL CHECK (text_similarity BETWEEN 0 AND 100),
  proximity_score INT NOT NULL CHECK (proximity_score BETWEEN 0 AND 100),
  distance_km NUMERIC(8, 2) NOT NULL,
  ai_rationale TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'owner_verified', 'finder_confirmed', 'shipping_arranged', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Deliveries Table (Courier Logistics & Commission)
CREATE TABLE IF NOT EXISTS public.deliveries (
  id TEXT PRIMARY KEY DEFAULT ('del_' || uuid_generate_v4()::text),
  match_id TEXT,
  lost_item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  found_item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  courier_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  courier_vehicle TEXT CHECK (courier_vehicle IN ('bicycle', 'motorcycle', 'car', 'van')),
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC(10, 7) NOT NULL,
  pickup_lng NUMERIC(10, 7) NOT NULL,
  finder_name TEXT NOT NULL,
  finder_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_lat NUMERIC(10, 7) NOT NULL,
  delivery_lng NUMERIC(10, 7) NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  distance_km NUMERIC(8, 2) NOT NULL,
  courier_payout NUMERIC(8, 2) NOT NULL,
  platform_fee NUMERIC(8, 2) NOT NULL,
  total_charged NUMERIC(8, 2) NOT NULL,
  discount_applied NUMERIC(8, 2) DEFAULT 0.00,
  pickup_otp TEXT NOT NULL,
  delivery_otp TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'en_route_pickup', 'picked_up', 'in_transit', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  delivered_at TIMESTAMPTZ
);

-- 6. Indexes for High-Speed Geospatial & Category Search
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_lat_lng ON public.items(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_matches_pair ON public.matches(lost_item_id, found_item_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

-- 7. Row-Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated read policies
CREATE POLICY "Public items can be viewed by anyone" ON public.items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update items" ON public.items FOR UPDATE USING (true);

CREATE POLICY "Public matches can be viewed by anyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Deliveries can be viewed by anyone" ON public.deliveries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Couriers can update deliveries" ON public.deliveries FOR UPDATE USING (true);

-- 8. Storage bucket for item photos
-- Run in Storage settings or SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('item-photos', 'item-photos', true);

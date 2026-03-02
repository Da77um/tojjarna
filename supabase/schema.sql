-- =============================================
-- Basket (باسكت) - Jordanian E-Commerce Platform
-- Full Supabase PostgreSQL Schema & RLS Policies
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. SUBSCRIPTION PLANS
-- =============================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  price_jod DECIMAL(10, 3) NOT NULL DEFAULT 0,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentage e.g. 2.5
  max_products INTEGER, -- NULL = unlimited
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default plans (using ON CONFLICT to avoid errors on re-run)
INSERT INTO plans (name_ar, name_en, price_jod, commission_rate, max_products, features, sort_order) 
VALUES
  ('المجاني', 'Free', 0, 5.0, 10, '["حتى 10 منتجات", "طلبات غير محدودة", "دعم الدفع عند الاستلام", "رابط متجر فرعي"]', 1),
  ('الأساسي', 'Basic', 15, 3.0, 100, '["حتى 100 منتج", "تحليلات المبيعات", "كوبونات الخصم", "إشعارات واتساب", "دعم البطاقات الائتمانية"]', 2),
  ('الاحترافي', 'Pro', 35, 2.0, NULL, '["منتجات غير محدودة", "تحليلات متقدمة", "نطاق مخصص مجاني", "ذكاء اصطناعي", "تكامل شركات الشحن"]', 3)
ON CONFLICT DO NOTHING;

-- =============================================
-- 1.1 PLATFORM SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, description)
VALUES 
  ('global_commission', '2.5', 'Default platform commission rate (percentage)'),
  ('platform_name', '"باسكت"', 'Platform display name'),
  ('contact_email', '"support@basket.jo"', 'Primary support email'),
  ('is_maintenance', 'false', 'Enable maintenance mode globally')
ON CONFLICT (key) DO NOTHING;

-- RLS for settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_public_read" ON platform_settings;
CREATE POLICY "settings_public_read" ON platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "settings_admin_all" ON platform_settings;
CREATE POLICY "settings_admin_all" ON platform_settings FOR ALL USING (is_admin());

-- =============================================
-- 2. USERS (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Removed strict auth.users reference to avoid trigger conflicts
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'vendor' CHECK (role IN ('admin', 'vendor', 'customer')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. STORES
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  slug VARCHAR(100) NOT NULL UNIQUE,
  description_ar TEXT,
  description_en TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme JSONB NOT NULL DEFAULT '{"primary_color":"#6C3CE1","secondary_color":"#F59E0B","font":"Tajawal","layout":"grid","logo_position":"right"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  whatsapp VARCHAR(20),
  instagram VARCHAR(100),
  facebook VARCHAR(255),
  custom_domain VARCHAR(255),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

-- =============================================
-- 4. CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);

-- =============================================
-- 5. PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_ar VARCHAR(500) NOT NULL,
  name_en VARCHAR(500),
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10, 3) NOT NULL,
  compare_price DECIMAL(10, 3), 
  cost_price DECIMAL(10, 3), 
  sku VARCHAR(100),
  barcode VARCHAR(100),
  weight DECIMAL(10, 3), 
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  is_digital BOOLEAN NOT NULL DEFAULT false,
  digital_file_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  meta_title_ar VARCHAR(255),
  meta_description_ar TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- =============================================
-- 6. PRODUCT VARIANTS
-- =============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  price_modifier DECIMAL(10, 3) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100),
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);

-- =============================================
-- 7. CUSTOMERS (per store)
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(100),
  notes TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_store_phone ON customers(store_id, phone);

-- =============================================
-- 8. ORDERS
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL UNIQUE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'card', 'apple_pay', 'google_pay')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_reference VARCHAR(255), 
  subtotal DECIMAL(10, 3) NOT NULL,
  shipping_cost DECIMAL(10, 3) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 3) NOT NULL DEFAULT 0,
  total DECIMAL(10, 3) NOT NULL,
  coupon_id UUID,
  coupon_code VARCHAR(50),
  shipping_address JSONB NOT NULL,
  notes TEXT,
  vendor_notes TEXT,
  tracking_number VARCHAR(100),
  shipping_company VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =============================================
-- 9. ORDER ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_ar VARCHAR(500) NOT NULL,
  product_name_en VARCHAR(500),
  product_image TEXT,
  variant_name VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 3) NOT NULL,
  total_price DECIMAL(10, 3) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =============================================
-- 10. COUPONS
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('percent', 'fixed')),
  value DECIMAL(10, 3) NOT NULL,
  min_order DECIMAL(10, 3),
  max_discount DECIMAL(10, 3),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);

-- =============================================
-- 11. REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- =============================================
-- 12. PLATFORM TRANSACTIONS (commissions)
-- =============================================
CREATE TABLE IF NOT EXISTS platform_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_total DECIMAL(10, 3) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(10, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 13. UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to safely create updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_stores_updated_at') THEN
    CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
    CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated_at') THEN
    CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- =============================================
-- 14. NEW USER HANDLER (auto-insert into users table)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    'vendor'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-apply trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 15. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Helper function for admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function: get vendor's store ids
CREATE OR REPLACE FUNCTION get_vendor_store_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(SELECT id FROM public.stores WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- === USERS ===
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

-- === PLANS (public read) ===
DROP POLICY IF EXISTS "plans_public_read" ON plans;
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "plans_admin_all" ON plans;
CREATE POLICY "plans_admin_all" ON plans FOR ALL USING (is_admin());

-- === STORES ===
DROP POLICY IF EXISTS "stores_public_read" ON stores;
CREATE POLICY "stores_public_read" ON stores FOR SELECT USING (is_active = true AND is_approved = true);
DROP POLICY IF EXISTS "stores_vendor_read_own" ON stores;
CREATE POLICY "stores_vendor_read_own" ON stores FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "stores_vendor_insert" ON stores;
CREATE POLICY "stores_vendor_insert" ON stores FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "stores_vendor_update_own" ON stores;
CREATE POLICY "stores_vendor_update_own" ON stores FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "stores_admin_all" ON stores;
CREATE POLICY "stores_admin_all" ON stores FOR ALL USING (is_admin());

-- === CATEGORIES ===
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "categories_vendor_manage" ON categories;
CREATE POLICY "categories_vendor_manage" ON categories FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- === PRODUCTS ===
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "products_vendor_manage" ON products;
CREATE POLICY "products_vendor_manage" ON products FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- === PRODUCT VARIANTS ===
DROP POLICY IF EXISTS "variants_public_read" ON product_variants;
CREATE POLICY "variants_public_read" ON product_variants FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "variants_vendor_manage" ON product_variants;
CREATE POLICY "variants_vendor_manage" ON product_variants FOR ALL USING (
  product_id IN (SELECT id FROM products WHERE store_id = ANY(get_vendor_store_ids()))
  OR is_admin()
);

-- === CUSTOMERS ===
DROP POLICY IF EXISTS "customers_vendor_manage" ON customers;
CREATE POLICY "customers_vendor_manage" ON customers FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- === ORDERS ===
DROP POLICY IF EXISTS "orders_vendor_read" ON orders;
CREATE POLICY "orders_vendor_read" ON orders FOR SELECT USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "orders_vendor_update_status" ON orders;
CREATE POLICY "orders_vendor_update_status" ON orders FOR UPDATE USING (
  store_id = ANY(get_vendor_store_ids())
);
DROP POLICY IF EXISTS "orders_insert_anyone" ON orders;
CREATE POLICY "orders_insert_anyone" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "orders_admin_all" ON orders;
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (is_admin());

-- === ORDER ITEMS ===
DROP POLICY IF EXISTS "order_items_vendor_read" ON order_items;
CREATE POLICY "order_items_vendor_read" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE store_id = ANY(get_vendor_store_ids()))
  OR is_admin()
);
DROP POLICY IF EXISTS "order_items_insert_anyone" ON order_items;
CREATE POLICY "order_items_insert_anyone" ON order_items FOR INSERT WITH CHECK (true);

-- === COUPONS ===
DROP POLICY IF EXISTS "coupons_vendor_manage" ON coupons;
CREATE POLICY "coupons_vendor_manage" ON coupons FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "coupons_public_read_active" ON coupons;
CREATE POLICY "coupons_public_read_active" ON coupons FOR SELECT USING (is_active = true);

-- === REVIEWS ===
DROP POLICY IF EXISTS "reviews_approved_public" ON reviews;
CREATE POLICY "reviews_approved_public" ON reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "reviews_vendor_manage" ON reviews;
CREATE POLICY "reviews_vendor_manage" ON reviews FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "reviews_insert_anyone" ON reviews;
CREATE POLICY "reviews_insert_anyone" ON reviews FOR INSERT WITH CHECK (true);

-- === PLATFORM TRANSACTIONS ===
DROP POLICY IF EXISTS "transactions_admin_only" ON platform_transactions;
CREATE POLICY "transactions_admin_only" ON platform_transactions FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "transactions_vendor_read" ON platform_transactions;
CREATE POLICY "transactions_vendor_read" ON platform_transactions FOR SELECT USING (
  store_id = ANY(get_vendor_store_ids())
);

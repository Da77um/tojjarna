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
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'suspended')),
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

-- =============================================
-- PHASE 2 TABLES
-- =============================================

-- 16. THEME VERSIONS (draft saves + version history)
-- =============================================
CREATE TABLE IF NOT EXISTS theme_versions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  label         VARCHAR(100),
  theme_config  JSONB NOT NULL,
  is_draft      BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_versions_store_id ON theme_versions(store_id, created_at DESC);

ALTER TABLE theme_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "theme_versions_vendor_manage" ON theme_versions;
CREATE POLICY "theme_versions_vendor_manage" ON theme_versions FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- =============================================
-- 17. STORE SHIPPING ZONES
-- =============================================
CREATE TABLE IF NOT EXISTS store_shipping_zones (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id           UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name_ar            VARCHAR(100) NOT NULL,
  cities             TEXT[] NOT NULL DEFAULT '{}',
  rate               DECIMAL(10,3) NOT NULL DEFAULT 0,
  free_above         DECIMAL(10,3),
  estimated_days_min INTEGER DEFAULT 1,
  estimated_days_max INTEGER DEFAULT 3,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON store_shipping_zones(store_id);

ALTER TABLE store_shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_vendor_manage" ON store_shipping_zones;
CREATE POLICY "shipping_vendor_manage" ON store_shipping_zones FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "shipping_public_read" ON store_shipping_zones;
CREATE POLICY "shipping_public_read" ON store_shipping_zones FOR SELECT USING (is_active = true);

-- =============================================
-- 18. STORE PAYMENT CONFIG
-- =============================================
CREATE TABLE IF NOT EXISTS store_payment_config (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id              UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  cod_enabled           BOOLEAN NOT NULL DEFAULT true,
  hyperpay_enabled      BOOLEAN NOT NULL DEFAULT false,
  hyperpay_entity_id    TEXT,
  paytabs_enabled       BOOLEAN NOT NULL DEFAULT false,
  paytabs_profile_id    TEXT,
  currencies            TEXT[] NOT NULL DEFAULT ARRAY['JOD'],
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE store_payment_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_config_vendor_manage" ON store_payment_config;
CREATE POLICY "payment_config_vendor_manage" ON store_payment_config FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- =============================================
-- 19. ABANDONED CARTS
-- =============================================
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name    VARCHAR(255),
  customer_phone   VARCHAR(20),
  customer_email   VARCHAR(255),
  cart_items       JSONB NOT NULL DEFAULT '[]',
  total            DECIMAL(10,3) NOT NULL DEFAULT 0,
  recovery_sent    BOOLEAN NOT NULL DEFAULT false,
  recovered        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_store_id ON abandoned_carts(store_id, recovered, created_at DESC);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "carts_vendor_manage" ON abandoned_carts;
CREATE POLICY "carts_vendor_manage" ON abandoned_carts FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "carts_insert_anyone" ON abandoned_carts;
CREATE POLICY "carts_insert_anyone" ON abandoned_carts FOR INSERT WITH CHECK (true);

-- =============================================
-- 20. STORE PAGES (CMS)
-- =============================================
CREATE TABLE IF NOT EXISTS store_pages (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id              UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  slug                  VARCHAR(100) NOT NULL,
  title_ar              VARCHAR(255) NOT NULL,
  title_en              VARCHAR(255),
  content_ar            TEXT,
  content_en            TEXT,
  meta_title_ar         VARCHAR(255),
  meta_description_ar   TEXT,
  is_published          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_store_pages_store_id ON store_pages(store_id);

ALTER TABLE store_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pages_public_read" ON store_pages;
CREATE POLICY "pages_public_read" ON store_pages FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "pages_vendor_manage" ON store_pages;
CREATE POLICY "pages_vendor_manage" ON store_pages FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);

-- =============================================
-- 21. STORE NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS store_notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL DEFAULT 'info',
  title_ar   VARCHAR(255) NOT NULL,
  message_ar TEXT,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON store_notifications(store_id, is_read, created_at DESC);

ALTER TABLE store_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_vendor_manage" ON store_notifications;
CREATE POLICY "notifications_vendor_manage" ON store_notifications FOR ALL USING (
  store_id = ANY(get_vendor_store_ids()) OR is_admin()
);
DROP POLICY IF EXISTS "notifications_insert_system" ON store_notifications;
CREATE POLICY "notifications_insert_system" ON store_notifications FOR INSERT WITH CHECK (true);

-- =============================================
-- 22. THEME MARKETPLACE (future)
-- =============================================
CREATE TABLE IF NOT EXISTS theme_marketplace (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar        VARCHAR(200) NOT NULL,
  name_en        VARCHAR(200) NOT NULL,
  description_ar TEXT,
  preview_url    TEXT,
  demo_url       TEXT,
  price_jod      DECIMAL(10,3) NOT NULL DEFAULT 0,
  theme_config   JSONB NOT NULL DEFAULT '{}',
  author_id      UUID REFERENCES users(id),
  is_approved    BOOLEAN NOT NULL DEFAULT false,
  install_count  INTEGER NOT NULL DEFAULT 0,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE theme_marketplace ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "marketplace_public_read" ON theme_marketplace;
CREATE POLICY "marketplace_public_read" ON theme_marketplace FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "marketplace_admin_all" ON theme_marketplace;
CREATE POLICY "marketplace_admin_all" ON theme_marketplace FOR ALL USING (is_admin());

-- updated_at triggers for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_abandoned_carts_updated_at') THEN
    CREATE TRIGGER trg_abandoned_carts_updated_at BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_store_pages_updated_at') THEN
    CREATE TRIGGER trg_store_pages_updated_at BEFORE UPDATE ON store_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payment_config_updated_at') THEN
    CREATE TRIGGER trg_payment_config_updated_at BEFORE UPDATE ON store_payment_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- =============================================
-- PHASE 3: SUPER ADMIN CONTROL TOWER
-- =============================================

-- Add an is_super_admin helper
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. admin_audit_logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_audit" ON admin_audit_logs;
CREATE POLICY "admin_all_audit" ON admin_audit_logs FOR ALL USING (is_super_admin());

-- 2. platform_payouts
CREATE TABLE IF NOT EXISTS platform_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    amount_jod DECIMAL(10,3) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payout_method VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

ALTER TABLE platform_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payouts_vendor_read" ON platform_payouts;
CREATE POLICY "payouts_vendor_read" ON platform_payouts FOR SELECT USING (store_id = ANY(get_vendor_store_ids()) OR is_super_admin());
DROP POLICY IF EXISTS "payouts_admin_all" ON platform_payouts;
CREATE POLICY "payouts_admin_all" ON platform_payouts FOR ALL USING (is_super_admin());

-- 3. platform_invoices
CREATE TABLE IF NOT EXISTS platform_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    invoice_type VARCHAR(50), 
    amount_jod DECIMAL(10,3) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid',
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

ALTER TABLE platform_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_vendor_read" ON platform_invoices;
CREATE POLICY "invoices_vendor_read" ON platform_invoices FOR SELECT USING (store_id = ANY(get_vendor_store_ids()) OR is_super_admin());
DROP POLICY IF EXISTS "invoices_admin_all" ON platform_invoices;
CREATE POLICY "invoices_admin_all" ON platform_invoices FOR ALL USING (is_super_admin());

-- 4. store_health_metrics
CREATE TABLE IF NOT EXISTS store_health_metrics (
    store_id UUID REFERENCES stores(id) PRIMARY KEY,
    health_score INTEGER DEFAULT 100,
    risk_level VARCHAR(20) DEFAULT 'low',
    fraud_flags INTEGER DEFAULT 0,
    chargeback_count INTEGER DEFAULT 0,
    admin_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_health_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "health_admin_all" ON store_health_metrics;
CREATE POLICY "health_admin_all" ON store_health_metrics FOR ALL USING (is_super_admin());

-- 5. platform_promos
CREATE TABLE IF NOT EXISTS platform_promos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,3) NOT NULL,
    applies_to_plan UUID REFERENCES plans(id),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_promos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promos_public_read" ON platform_promos;
CREATE POLICY "promos_public_read" ON platform_promos FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "promos_admin_all" ON platform_promos;
CREATE POLICY "promos_admin_all" ON platform_promos FOR ALL USING (is_super_admin());
-- Ensure status is applied to stores safely if table already exists
ALTER TABLE stores ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'suspended'));

-- =============================================
-- 18. ANALYTICS RPC FUNCTIONS
-- =============================================

-- Get Vendor Analytics
CREATE OR REPLACE FUNCTION get_vendor_analytics(target_store_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_revenue DECIMAL(10,3);
  total_orders INTEGER;
  total_customers INTEGER;
  revenue_trend JSONB;
BEGIN
  -- Verify ownership or admin status
  IF NOT (target_store_id = ANY(get_vendor_store_ids()) OR is_super_admin()) THEN
    RAISE EXCEPTION 'Access denied. You must own this store or be an admin.';
  END IF;

  -- 1. Total Revenue (from non-cancelled orders)
  SELECT COALESCE(SUM(total_jod), 0) INTO total_revenue
  FROM orders
  WHERE store_id = target_store_id 
  AND status NOT IN ('cancelled', 'refunded');

  -- 2. Total Orders
  SELECT COUNT(id) INTO total_orders
  FROM orders
  WHERE store_id = target_store_id;

  -- 3. Total Customers
  SELECT COUNT(id) INTO total_customers
  FROM customers
  WHERE store_id = target_store_id;

  -- 4. Revenue Trend (Last 30 days grouped by day)
  WITH last_30_days AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date AS day
  ),
  daily_revenue AS (
    SELECT 
      DATE(created_at) AS order_date,
      SUM(total_jod) AS revenue
    FROM orders
    WHERE store_id = target_store_id
    AND status NOT IN ('cancelled', 'refunded')
    AND created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', d.day,
      'revenue', COALESCE(r.revenue, 0)
    ) ORDER BY d.day
  ) INTO revenue_trend
  FROM last_30_days d
  LEFT JOIN daily_revenue r ON d.day = r.order_date;

  RETURN jsonb_build_object(
    'total_revenue', total_revenue,
    'total_orders', total_orders,
    'total_customers', total_customers,
    'revenue_trend', COALESCE(revenue_trend, '[]'::jsonb)
  );
END;
$$;

-- Get Admin Analytics
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  global_gmv DECIMAL(10,3);
  total_commission DECIMAL(10,3);
  active_stores INTEGER;
  total_platform_orders INTEGER;
  revenue_trend JSONB;
BEGIN
  -- Verify super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied. Only super admins can view platform analytics.';
  END IF;

  -- 1. Global GMV (all non-cancelled orders)
  SELECT COALESCE(SUM(total_jod), 0) INTO global_gmv
  FROM orders
  WHERE status NOT IN ('cancelled', 'refunded');

  -- 2. Active Stores
  SELECT COUNT(id) INTO active_stores
  FROM stores
  WHERE status = 'approved';

  -- 3. Total Orders
  SELECT COUNT(id) INTO total_platform_orders
  FROM orders;

  -- 4. Total Commission (summing the calculated commission for each order based on the store plan)
  SELECT COALESCE(SUM(o.total_jod * (p.commission_rate / 100)), 0) INTO total_commission
  FROM orders o
  JOIN stores s ON o.store_id = s.id
  JOIN plans p ON s.plan_id = p.id
  WHERE o.status NOT IN ('cancelled', 'refunded');

  -- 5. Revenue Trend (Last 30 days GMV)
  WITH last_30_days AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date AS day
  ),
  daily_gmv AS (
    SELECT 
      DATE(created_at) AS order_date,
      SUM(total_jod) AS total
    FROM orders
    WHERE status NOT IN ('cancelled', 'refunded')
    AND created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', d.day,
      'gmv', COALESCE(r.total, 0)
    ) ORDER BY d.day
  ) INTO revenue_trend
  FROM last_30_days d
  LEFT JOIN daily_gmv r ON d.day = r.order_date;

  RETURN jsonb_build_object(
    'global_gmv', global_gmv,
    'total_commission', total_commission,
    'active_stores', active_stores,
    'total_orders', total_platform_orders,
    'revenue_trend', COALESCE(revenue_trend, '[]'::jsonb)
  );
END;
$$;

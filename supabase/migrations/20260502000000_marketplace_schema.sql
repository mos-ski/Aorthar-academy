-- ═══════════════════════════════════════════════════════════════════════════
-- AORTHAR MARKETPLACE MODULE — SCHEMA
-- Migration: 20260502000000_marketplace_schema.sql
-- Digital product storefront — PDFs, templates, guides, toolkits
-- Email-only purchase flow (no auth.users FK on purchases)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PRODUCTS ───────────────────────────────────────────────────────────

CREATE TYPE marketplace_category AS ENUM (
  'pdf',
  'template',
  'guide',
  'toolkit',
  'other'
);

CREATE TABLE marketplace_products (
  id            UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT                 UNIQUE NOT NULL
                                     CHECK (slug ~ '^[a-z0-9-]+$'),
  name          TEXT                 NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  description   TEXT                 NOT NULL DEFAULT '',
  price_ngn     INTEGER              NOT NULL DEFAULT 0 CHECK (price_ngn >= 0),
  category      marketplace_category NOT NULL DEFAULT 'other',
  file_url      TEXT                 NOT NULL DEFAULT ''
                                     CHECK (file_url = '' OR file_url ~* '^https?://'),
  thumbnail_url TEXT                 CHECK (thumbnail_url IS NULL OR thumbnail_url ~* '^https?://'),
  is_active     BOOLEAN              NOT NULL DEFAULT false,
  sort_order    SMALLINT             NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketplace_products_active
  ON marketplace_products (sort_order, created_at)
  WHERE is_active = true;

COMMENT ON TABLE marketplace_products IS 'Admin-created digital products (PDFs, templates, etc.) sold via Paystack.';
COMMENT ON COLUMN marketplace_products.file_url IS 'Direct HTTPS download URL — can be Supabase Storage, Google Drive, Dropbox, etc.';
COMMENT ON COLUMN marketplace_products.is_active IS 'Only active products appear on the public storefront.';

-- ── 2. PURCHASES ──────────────────────────────────────────────────────────

CREATE TABLE marketplace_purchases (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID        NOT NULL REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  email               TEXT        NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  paystack_reference  TEXT        UNIQUE NOT NULL
                                  CHECK (char_length(paystack_reference) BETWEEN 5 AND 120),
  payment_status      TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (payment_status IN ('pending', 'paid', 'failed')),
  amount_paid_ngn     INTEGER     CHECK (amount_paid_ngn IS NULL OR amount_paid_ngn >= 0),
  paid_at             TIMESTAMPTZ,

  -- Token-gated download (UUID pre-generated at insert time)
  download_token      UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  token_expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  download_count      SMALLINT    NOT NULL DEFAULT 0,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_purchases_email     ON marketplace_purchases (email);
CREATE INDEX idx_mkt_purchases_product   ON marketplace_purchases (product_id);
CREATE INDEX idx_mkt_purchases_reference ON marketplace_purchases (paystack_reference);
CREATE INDEX idx_mkt_purchases_token     ON marketplace_purchases (download_token)
  WHERE payment_status = 'paid';

COMMENT ON TABLE marketplace_purchases IS 'One row per Paystack checkout attempt. Email-only — no auth.users FK.';
COMMENT ON COLUMN marketplace_purchases.download_token IS 'UUID generated at insert time. Valid for 7 days after purchase creation. Validated by /api/marketplace/download.';
COMMENT ON COLUMN marketplace_purchases.download_count IS 'Informational counter; not enforced as a hard limit.';

-- ── 3. UPDATED_AT TRIGGERS ────────────────────────────────────────────────

CREATE TRIGGER trg_marketplace_products_updated_at
  BEFORE UPDATE ON marketplace_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_marketplace_purchases_updated_at
  BEFORE UPDATE ON marketplace_purchases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. RLS — disabled (all access via service role key) ───────────────────
-- Buyers have no auth.users accounts. All reads/writes use createAdminClient().
ALTER TABLE marketplace_products  DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETPLACE TEST PRICE — Google Ads Search Playbook
-- Migration: 20260502000004_marketplace_google_ads_test_price.sql
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE marketplace_products
SET price_ngn = 100
WHERE slug = 'google-ads-search-playbook';

-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETPLACE SEED FIX — Ad Playbook Thumbnails
-- Migration: 20260502000003_marketplace_playbook_thumbnails.sql
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE marketplace_products
SET thumbnail_url = CASE slug
  WHEN 'ad-campaign-playbook'
    THEN 'https://aorthar.com/marketplace/thumbnails/ad-campaign-playbook.png'
  WHEN 'facebook-meta-ads-playbook'
    THEN 'https://aorthar.com/marketplace/thumbnails/facebook-meta-ads-playbook.png'
  WHEN 'google-ads-search-playbook'
    THEN 'https://aorthar.com/marketplace/thumbnails/google-ads-search-playbook.png'
  WHEN 'lightforth-ad-campaign-playbook'
    THEN 'https://aorthar.com/marketplace/thumbnails/lightforth-ad-campaign-playbook.png'
  WHEN 'snapchat-ads-playbook'
    THEN 'https://aorthar.com/marketplace/thumbnails/snapchat-ads-playbook.png'
  WHEN 'tiktok-ads-playbook-2026'
    THEN 'https://aorthar.com/marketplace/thumbnails/tiktok-ads-playbook-2026.png'
  ELSE thumbnail_url
END
WHERE slug IN (
  'ad-campaign-playbook',
  'facebook-meta-ads-playbook',
  'google-ads-search-playbook',
  'lightforth-ad-campaign-playbook',
  'snapchat-ads-playbook',
  'tiktok-ads-playbook-2026'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETPLACE SEED FIX — Activate Ad Playbooks
-- Migration: 20260502000002_marketplace_activate_playbooks.sql
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO marketplace_products
  (slug, name, description, price_ngn, category, file_url, is_active, sort_order)
VALUES
  (
    'ad-campaign-playbook',
    'Ad Campaign Playbook',
    'A comprehensive guide to planning and executing ad campaigns that actually move the needle. Covers campaign structure, targeting, budgeting, and optimization strategies across paid channels — built for marketers and business owners who want a clear framework from day one.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/6f10apjyfu72uz9qzsbpk/Ad_Campaign_Playbook.docx?rlkey=miys5c6cg2myz0ppduua64qxp&dl=1',
    true,
    1
  ),
  (
    'facebook-meta-ads-playbook',
    'Facebook & Meta Ads Playbook',
    'Everything you need to run profitable Facebook and Instagram ads. From setting up your Business Manager to writing copy that converts — covers audience targeting, ad formats, creative strategy, and how to scale what is already working.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/f43zicks0p93ir1s5m02f/Facebook_Meta_Ads_Playbook.docx?rlkey=jk5x7row7lw62658ylz542zga&dl=1',
    true,
    2
  ),
  (
    'google-ads-search-playbook',
    'Google Ads Search Playbook',
    'A step-by-step guide to winning on Google Search. Covers keyword strategy, ad copywriting, bid management, Quality Score, and how to structure campaigns that bring in qualified traffic without burning your budget.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/naoufmh6n5yt21c3oz6sp/Google_Ads_Search_Playbook.docx?rlkey=19nw9waedj1bwe3p1och88ahv&dl=1',
    true,
    3
  ),
  (
    'lightforth-ad-campaign-playbook',
    'Lightforth Ad Campaign Playbook',
    'The exact ad campaign framework used at Lightforth — a real-world case study turned playbook. Get the strategies, creative direction, and targeting approach that drove measurable results, packaged into a format you can apply to your own campaigns immediately.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/tr0f6subvvdvr6w36k1cl/Lightforth_Ad_Campaign_Playbook.docx?rlkey=or2nbxkqwm6l05kc1vplaxfm2&dl=1',
    true,
    4
  ),
  (
    'snapchat-ads-playbook',
    'Snapchat Ads Playbook',
    'Reach younger, highly engaged audiences where they actually spend time. This playbook covers Snapchat ad formats, creative best practices, audience setup, and how to measure what matters — so your spend goes further on a platform most brands still underuse.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/a2r65bjzj8k26os2oqfdz/Snapchat_Ads_Playbook.docx?rlkey=jh0dx343duvj2cikbdo9u7gig&dl=1',
    true,
    5
  ),
  (
    'tiktok-ads-playbook-2026',
    'TikTok Ads Playbook 2026',
    'The updated guide to advertising on TikTok in 2026. Covers Spark Ads, TopView, In-Feed formats, creative strategy, and how to build campaigns that blend in with organic content while still driving conversions. Built around what is working right now.',
    1000,
    'guide',
    'https://www.dropbox.com/scl/fi/laaen02mkzsoeeyen3y49/TikTok_Ads_Playbook_2026.docx?rlkey=l07xwhuy9ps3p0lkalw7p7wec&dl=1',
    true,
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_ngn = EXCLUDED.price_ngn,
  category = EXCLUDED.category,
  file_url = EXCLUDED.file_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

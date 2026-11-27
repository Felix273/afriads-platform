-- ============================================
-- Migration 002: Unify Ad Placements and Ad Zones
-- ============================================

BEGIN;

CREATE INDEX IF NOT EXISTS idx_ad_zones_website ON ad_zones(website_id);
CREATE INDEX IF NOT EXISTS idx_ad_zones_status ON ad_zones(status);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ad_placements' AND table_type = 'BASE TABLE'
  ) THEN
    IF (SELECT count(*) FROM ad_placements) = 0 THEN
      DROP TABLE ad_placements CASCADE;
      CREATE OR REPLACE VIEW ad_placements AS
      SELECT 
        id,
        website_id,
        name,
        zone_type AS placement_type,
        dimensions AS ad_format,
        status,
        created_at
      FROM ad_zones;
    END IF;
  END IF;
END $$;

COMMIT;

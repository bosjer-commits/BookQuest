-- Cleanup Script: Remove Old BookDisc Tables
-- Run this FIRST before running database-schema.sql

-- Drop all old tables (this will delete all data - OK since app was never used)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS reading_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Old BookDisc tables removed successfully! Now run database-schema.sql';
END $$;

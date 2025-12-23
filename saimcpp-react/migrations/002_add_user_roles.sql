-- ============================================
-- PHASE 2: User Roles System
-- Migration Script for SaimCPP Platform
-- ============================================

-- 1. Create Role Enum Type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'founder', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Role Column to Profiles Table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- 3. Set Founder Role for Platform Founder
UPDATE profiles
SET role = 'founder'
WHERE email = 'saimkhanwah@gmail.com' OR username = 'saimbuilds';

-- 4. Create Index for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 5. Add Comment for Documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (default), founder (platform creator), admin (moderator)';

-- ============================================
-- Migration Complete!
-- Next Steps:
-- 1. Copy this SQL
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Run this migration
-- 4. Verify in Table Editor that your profile has role = 'founder'
-- ============================================

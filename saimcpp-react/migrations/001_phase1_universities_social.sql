-- ============================================
-- PHASE 1: Multi-University Support & Social Features
-- Migration Script for SaimCPP Platform
-- ============================================

-- 1. Create Universities Table
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL UNIQUE,
    domain TEXT, -- email domain (e.g., "nu.edu.pk")
    logo_url TEXT,
    city TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Pakistani Universities
INSERT INTO universities (name, short_name, domain, city) VALUES
('FAST National University of Computer and Emerging Sciences', 'FAST-NUCES', 'nu.edu.pk', 'Islamabad'),
('National University of Sciences and Technology', 'NUST', 'nust.edu.pk', 'Islamabad'),
('Lahore University of Management Sciences', 'LUMS', 'lums.edu.pk', 'Lahore'),
('Institute of Business Administration', 'IBA', 'iba.edu.pk', 'Karachi'),
('Ghulam Ishaq Khan Institute', 'GIKI', 'giki.edu.pk', 'Topi'),
('COMSATS University Islamabad', 'COMSATS', 'comsats.edu.pk', 'Islamabad'),
('Beaconhouse National University', 'BNU', 'bnu.edu.pk', 'Lahore'),
('University of Engineering and Technology', 'UET', 'uet.edu.pk', 'Lahore'),
('Air University', 'AIR', 'au.edu.pk', 'Islamabad'),
('Pakistan Institute of Engineering and Applied Sciences', 'PIEAS', 'pieas.edu.pk', 'Islamabad'),
('NED University of Engineering and Technology', 'NED', 'neduet.edu.pk', 'Karachi'),
('University of Karachi', 'KU', 'uok.edu.pk', 'Karachi'),
('University of Punjab', 'PU', 'pu.edu.pk', 'Lahore'),
('Quaid-i-Azam University', 'QAU', 'qau.edu.pk', 'Islamabad'),
('Other', 'OTHER', NULL, NULL);

-- 2. Create Followers Table
CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);

-- 3. Update Profiles Table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id),
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE;

-- Generate usernames from emails for existing users
UPDATE profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;

-- Backfill FAST NUCES for existing users with @nu.edu.pk emails
UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE short_name = 'FAST-NUCES')
WHERE email LIKE '%@nu.edu.pk' OR email LIKE '%@edu.nu.edu.pk';

-- 4. Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count for the user being followed
        UPDATE profiles 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.following_id;
        
        -- Increment following count for the follower
        UPDATE profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        UPDATE profiles 
        SET follower_count = GREATEST(follower_count - 1, 0)
        WHERE id = OLD.following_id;
        
        -- Decrement following count
        UPDATE profiles 
        SET following_count = GREATEST(following_count - 1, 0)
        WHERE id = OLD.follower_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS follower_count_trigger ON followers;
CREATE TRIGGER follower_count_trigger
AFTER INSERT OR DELETE ON followers
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Universities: Everyone can read
CREATE POLICY "Universities are viewable by everyone"
ON universities FOR SELECT
USING (true);

-- Followers: Users can view all followers
CREATE POLICY "Followers are viewable by everyone"
ON followers FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON followers FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON followers FOR DELETE
USING (auth.uid() = follower_id);

-- 6. Create helper views
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.username,
    p.total_score,
    p.current_streak,
    p.follower_count,
    p.following_count,
    u.short_name as university,
    COUNT(DISTINCT s.problem_id) FILTER (WHERE s.status = 'accepted') as problems_solved,
    COUNT(s.id) as total_submissions
FROM profiles p
LEFT JOIN universities u ON p.university_id = u.id
LEFT JOIN submissions s ON p.id = s.user_id
GROUP BY p.id, p.email, p.full_name, p.username, p.total_score, p.current_streak, 
         p.follower_count, p.following_count, u.short_name;

-- ============================================
-- Migration Complete!
-- ============================================

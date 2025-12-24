-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these AFTER creating the table to verify everything works

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'problems'
) as table_exists;

-- 2. Count rows (should be 1 after migration)
SELECT COUNT(*) as total_problems FROM problems;

-- 3. View sample data
SELECT id, title, difficulty, track, category 
FROM problems 
LIMIT 5;

-- 4. Test full-text search
SELECT id, title, difficulty 
FROM problems 
WHERE to_tsvector('english', title || ' ' || description) 
      @@ to_tsquery('english', 'array & sum')
ORDER BY difficulty;

-- 5. Test filtering
SELECT id, title, difficulty, acceptance_rate
FROM problems 
WHERE track = 'pf' 
  AND difficulty = 'easy'
  AND is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'problems';

-- 7. Check RLS policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'problems';

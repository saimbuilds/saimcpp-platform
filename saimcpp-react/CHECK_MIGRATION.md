# ⚠️ MIGRATION CHECK - FAST NUCES Students

## Issue
FAST NUCES filter showing no students? The migration may not have been run yet!

## Quick Check
Run this in Supabase SQL Editor to see if FAST students are assigned:

```sql
-- Check how many FAST students have university_id set
SELECT 
    COUNT(*) as total_fast_students,
    COUNT(university_id) as students_with_university
FROM profiles
WHERE email LIKE '%nu.edu.pk';

-- See which university FAST students are assigned to
SELECT 
    u.short_name as university,
    COUNT(*) as student_count
FROM profiles p
LEFT JOIN universities u ON p.university_id = u.id
WHERE p.email LIKE '%nu.edu.pk'
GROUP BY u.short_name;
```

## Expected Result
- All FAST students should have `university_id` pointing to FAST-NUCES
- If `students_with_university` is 0, the migration wasn't run

## Fix
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration: `migrations/001_phase1_universities_social.sql`
3. Verify with the query above
4. Refresh the app - FAST filter should now work!

## Manual Fix (if migration fails)
If the full migration fails, run just this part:

```sql
-- Create FAST university if not exists
INSERT INTO universities (name, short_name, domain, city)
VALUES ('FAST National University', 'FAST-NUCES', 'nu.edu.pk', 'Multi-City')
ON CONFLICT (short_name) DO NOTHING;

-- Assign all nu.edu.pk emails to FAST
UPDATE profiles
SET university_id = (SELECT id FROM universities WHERE short_name = 'FAST-NUCES')
WHERE email LIKE '%nu.edu.pk' AND university_id IS NULL;
```

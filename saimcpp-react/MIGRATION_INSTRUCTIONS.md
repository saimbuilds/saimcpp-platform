# Database Migration Instructions

## Running the Phase 1 Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Open your project: `hvizuvovmdcjixqwmcgw`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `migrations/001_phase1_universities_social.sql`
6. Paste into the SQL editor
7. Click **Run** button
8. Verify tables were created in **Table Editor**

### Option 2: Command Line
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Run migration
psql "postgresql://postgres.hvizuvovmdcjixqwmcgw:Saimbuilds@1122@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" < migrations/001_phase1_universities_social.sql
```

### Verify Migration Success
After running, check that these tables exist:
- ✅ `universities` (should have 15 Pakistani universities)
- ✅ `followers` (initially empty)
- ✅ `profiles` (updated with new columns: university_id, username, bio, etc.)

### Verify Data
```sql
-- Check universities
SELECT * FROM universities ORDER BY name;

-- Check existing users got FAST assigned
SELECT email, username, 
       (SELECT short_name FROM universities WHERE id = university_id) as university
FROM profiles 
LIMIT 10;
```

## Next Steps After Migration
Once migration is complete, the React app will automatically work with the new schema!

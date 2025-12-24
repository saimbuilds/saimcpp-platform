# 🚀 Step-by-Step: Hybrid Question Storage Implementation

## Your Part vs My Part

### ✅ YOUR TASKS
1. Run SQL migration in Supabase
2. Add environment variable
3. Run the import script
4. Test the application

### ✅ MY TASKS (Already Done!)
- ✅ Created database schema SQL file
- ✅ Built import/export scripts
- ✅ Created React hooks for fetching
- ✅ Added npm scripts

---

## 📝 Step-by-Step Instructions for YOU

### **Step 1: Run SQL Migration in Supabase** (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `saimbuilds/saimcpp-platform`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and Paste the SQL**
   - Open file: `migrations/create_problems_table.sql`
   - Copy the ENTIRE file content
   - Paste into Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - Go to "Table Editor" in sidebar
   - You should see a new table called `problems`
   - Click on it, you should see 1 sample row

---

### **Step 2: Add Environment Variable** (2 minutes)

1. **Get Service Role Key**
   - In Supabase Dashboard
   - Go to: Project Settings → API
   - Find "service_role" key section
   - Click the "👁️ Reveal" button
   - Copy the key (starts with `eyJ...`)

2. **Add to .env file**
   ```bash
   # Open .env file in your project root
   # Add this line (replace YOUR_KEY with actual key):
   SUPABASE_SERVICE_KEY=YOUR_KEY_HERE
   ```

3. **Save the file**

> **⚠️ IMPORTANT**: Never commit this key to GitHub! It's already in `.gitignore`

---

### **Step 3: Run Import Script** (3 minutes)

1. **Test Import (Dry Run First)**
   ```bash
   npm run db:import:dry
   ```
   
   **Expected Output:**
   ```
   📚 Found categories: Arrays, Pointers, Recursion, ...
   📁 Processing category: Arrays
      ✓ Array Sum → pf-arrays-array-sum-001
      ✓ Find Maximum → pf-arrays-find-maximum-002
   ...
   📊 Total problems to import: 85
   🔍 DRY RUN MODE - No data will be inserted
   ✅ Dry run complete!
   ```

2. **Actual Import (If dry run looks good)**
   ```bash
   npm run db:import
   ```
   
   **Expected Output:**
   ```
   🚀 Starting database import...
   ✅ Batch 1: Imported 50 problems
   ✅ Batch 2: Imported 35 problems
   
   📊 IMPORT SUMMARY
   ✅ Successfully imported: 85 problems
   ❌ Failed: 0 problems
   📈 Success rate: 100.0%
   🔍 Database verification: 86 total problems in database
   🎉 Import complete!
   ```

3. **Verify in Supabase**
   - Go to Supabase → Table Editor → `problems`
   - You should see 86 rows (85 imported + 1 sample)
   - Click on a few rows to verify data looks correct

---

### **Step 4: Test the Application** (5 minutes)

**Now I'll update the React code to use the database instead of JSON files.**

After I update the code, you'll need to:

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Go to Problems page**
   - Navigate to any track (PF, DSA, etc.)
   - Click on "Problems"

3. **Test Filtering**
   - Filter by difficulty (Easy/Medium/Hard)
   - Filter by category (Arrays, Pointers, etc.)
   - Verify problems load correctly

4. **Test Pagination**
   - Navigate between pages
   - Verify "Next" and "Previous" buttons work
   - Try jumping to specific pages

---

## 🎯 Quick Checklist

- [ ] Step 1: SQL migration run in Supabase ✅
- [ ] Step 2: Service key added to `.env` ✅
- [ ] Step 3: Dry run successful ✅
- [ ] Step 4: Actual import successful ✅
- [ ] Step 5: Verified data in Supabase ✅
- [ ] Step 6: App loads problems from database ✅

---

## 🆘 Troubleshooting

### Problem: "Missing environment variables"
**Solution**: Make sure `.env` file has both:
```
VITE_SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_service_key
```

### Problem: "Table does not exist"
**Solution**: Run the SQL migration first (Step 1)

### Problem: Import fails with "permission denied"
**Solution**: 
- Make sure you're using the **SERVICE_ROLE** key, not the anon key
- The service key bypasses RLS policies

### Problem: "Cannot find module '@supabase/supabase-js'"
**Solution**: 
```bash
npm install
```

---

## 📊 What Happens Next?

After you complete these steps, I'll:
1. Update `Problems.jsx` to use `useProblems` hook
2. Add pagination component
3. Test everything together
4. Create a walkthrough showing the migration

---

## 💡 Benefits You'll Get

✅ **Performance**: Queries < 100ms vs loading entire JSON files  
✅ **Filtering**: Instant filter by difficulty/category/tags  
✅ **Search**: Full-text search on titles and descriptions  
✅ **Pagination**: Load 20 at a time instead of all 500+  
✅ **Scalability**: Can add 10,000+ problems easily  
✅ **Features**: Problem of the day, recommendations, stats  

---

**Ready to start? Begin with Step 1!** 🚀

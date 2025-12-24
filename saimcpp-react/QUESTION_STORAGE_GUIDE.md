# Question Storage Strategy Guide

> **Question**: How should I store 500+ questions with test cases?  
> **Answer**: Use a **hybrid approach** - Database for metadata, JSON/JSONB for test cases

---

## 🏗️ Architecture Comparison

### Your Current Approach: JSON Files ✅
```
problems/
├── Arrays/
│   ├── arrays_1d_easy.json
│   ├── arrays_1d_medium.json
│   └── arrays_1d_hard.json
├── Pointers/
│   ├── pointers_easy.json
│   └── ...
└── DryRun/
    └── ...
```

**Good for**: 
- ✅ 50-200 problems per track
- ✅ Version control (Git)
- ✅ Easy to edit manually
- ✅ No database queries needed

**Problems at scale**:
- ❌ Can't filter/search efficiently
- ❌ Have to load entire category
- ❌ No pagination
- ❌ Hard to update individual problems

---

## 🎯 Recommended: Hybrid Database Approach

### LeetCode's Approach (Simplified)

```
Database Tables:
├── problems (metadata only - fast queries)
│   ├── id, title, difficulty, category, track
│   ├── points, time_limit, memory_limit
│   └── description, constraints, input_format
│
└── test_cases (stored as JSONB)
    ├── problem_id
    ├── type (sample/hidden)
    ├── test_cases (JSONB array)
    └── created_at
```

**Benefits**:
- ✅ Fast filtering: `SELECT * FROM problems WHERE difficulty='easy' AND track='pf' LIMIT 20`
- ✅ Efficient search: Full-text search on descriptions
- ✅ Pagination: Load 20 problems at a time
- ✅ Dynamic features: Problem of the day, random practice
- ✅ Scales to 10,000+ problems

---

## 📊 Implementation Plan

### Phase 1: Database Schema

```sql
-- Main Problems Table
CREATE TABLE problems (
  id VARCHAR(50) PRIMARY KEY, -- 'pf-arrays-001'
  track VARCHAR(50) NOT NULL, -- 'pf', 'pf-lab', 'oop', 'dsa'
  category VARCHAR(100) NOT NULL, -- 'Arrays', 'Pointers', etc.
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  description TEXT NOT NULL,
  
  -- Format & Constraints
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  
  -- Code Templates
  starter_code_cpp TEXT,
  starter_code_python TEXT, -- Future support
  starter_code_java TEXT, -- Future support
  
  -- Limits & Points
  time_limit_ms INTEGER DEFAULT 1000,
  memory_limit_mb INTEGER DEFAULT 256,
  points INTEGER NOT NULL,
  
  -- Test Cases (JSONB for flexibility)
  sample_test_cases JSONB NOT NULL,
  hidden_test_cases JSONB NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  premium_only BOOLEAN DEFAULT false,
  tags TEXT[], -- ['array', 'sorting', 'two-pointer']
  companies TEXT[], -- Future: ['google', 'meta', 'amazon']
  
  -- Stats (updated via triggers)
  total_submissions INTEGER DEFAULT 0,
  accepted_submissions INTEGER DEFAULT 0,
  acceptance_rate FLOAT GENERATED ALWAYS AS 
    (CASE WHEN total_submissions > 0 
     THEN CAST(accepted_submissions AS FLOAT) / total_submissions 
     ELSE 0 END) STORED,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_problems_track ON problems(track);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_category ON problems(track, category);
CREATE INDEX idx_problems_tags ON problems USING GIN(tags);

-- Full-text search
CREATE INDEX idx_problems_search ON problems 
  USING GIN(to_tsvector('english', title || ' ' || description));

-- Example: Search problems
-- SELECT * FROM problems 
-- WHERE to_tsvector('english', title || ' ' || description) 
--       @@ to_tsquery('english', 'array & sorting')
-- ORDER BY difficulty, created_at;
```

---

## 📝 Test Cases Format (JSONB)

### Sample vs Hidden Test Cases

```json
{
  "sample_test_cases": [
    {
      "id": 1,
      "input": "5\n1 2 3 4 5",
      "output": "15",
      "explanation": "Sum: 1+2+3+4+5 = 15"
    },
    {
      "id": 2,
      "input": "3\n10 20 30",
      "output": "60",
      "explanation": "Sum: 10+20+30 = 60"
    }
  ],
  "hidden_test_cases": [
    {
      "id": 3,
      "input": "4\n-5 5 -3 3",
      "output": "0"
    },
    {
      "id": 4,
      "input": "1\n100",
      "output": "100"
    },
    {
      "id": 5,
      "input": "6\n1 1 1 1 1 1",
      "output": "6"
    }
  ]
}
```

**Why JSONB?**
- ✅ Flexible structure
- ✅ Can add new fields without schema changes
- ✅ Queryable: `SELECT * FROM problems WHERE sample_test_cases @> '[{"id": 1}]'`
- ✅ Efficient storage (binary format)
- ✅ Validation possible with CHECK constraints

---

## 🔄 Migration: JSON → Database

### Option 1: Bulk Import Script

```javascript
// scripts/import-problems.js
import { supabase } from '../src/lib/supabase.js';
import fs from 'fs';
import path from 'path';

async function importProblems() {
  const problemsDir = './problems';
  const categories = ['Arrays', 'Pointers', 'Recursion', 'Functions', 'DynamicMemory', 'Bitwise'];
  
  for (const category of categories) {
    const categoryPath = path.join(problemsDir, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Extract difficulty from filename
      const difficulty = file.includes('easy') ? 'easy' 
                       : file.includes('medium') ? 'medium' 
                       : 'hard';
      
      for (const problem of data.problems) {
        // Transform to database format
        const dbProblem = {
          id: `pf-${category.toLowerCase()}-${problem.title.toLowerCase().replace(/\s+/g, '-')}`,
          track: 'pf',
          category: category,
          title: problem.title,
          difficulty: difficulty,
          description: problem.description,
          input_format: problem.inputFormat,
          output_format: problem.outputFormat,
          constraints: problem.constraints,
          starter_code_cpp: problem.starterCode,
          points: problem.points || 10,
          sample_test_cases: problem.sampleTestCases,
          hidden_test_cases: problem.hiddenTestCases,
          tags: [category.toLowerCase()],
        };
        
        // Insert into database
        const { error } = await supabase
          .from('problems')
          .upsert(dbProblem);
          
        if (error) {
          console.error(`Error importing ${problem.title}:`, error);
        } else {
          console.log(`✅ Imported: ${problem.title}`);
        }
      }
    }
  }
  
  console.log('✅ Import complete!');
}

importProblems();
```

Run it:
```bash
node scripts/import-problems.js
```

---

## 🚀 Fetching Problems (React)

### Before (JSON):
```javascript
// Had to load entire file
import arraysEasy from '../../../problems/Arrays/arrays_1d_easy.json';

// All 10 problems loaded even if you show 5
const problems = arraysEasy.problems;
```

### After (Database):
```javascript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

function useProblems(track, category, difficulty, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['problems', track, category, difficulty, page],
    queryFn: async () => {
      let query = supabase
        .from('problems')
        .select('*', { count: 'exact' })
        .eq('track', track)
        .eq('is_active', true);
      
      if (category) query = query.eq('category', category);
      if (difficulty) query = query.eq('difficulty', difficulty);
      
      // Pagination
      const start = (page - 1) * limit;
      query = query
        .range(start, start + limit - 1)
        .order('difficulty', { ascending: true })
        .order('created_at', { ascending: true });
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return { problems: data, total: count };
    }
  });
}

// Usage:
function ProblemsList() {
  const { data, isLoading } = useProblems('pf', 'Arrays', 'easy', 1, 20);
  
  return (
    <div>
      {data?.problems.map(p => (
        <ProblemCard key={p.id} problem={p} />
      ))}
      <Pagination total={data?.total} />
    </div>
  );
}
```

**Benefits**:
- ✅ Only load 20 problems at a time (fast!)
- ✅ Filter by track + category + difficulty
- ✅ Easy to add search later
- ✅ Pagination built-in
- ✅ Real-time updates

---

## 🎨 Advanced Features (Possible with Database)

### 1. Problem of the Day
```sql
SELECT * FROM problems 
WHERE track = 'pf' 
ORDER BY RANDOM() 
LIMIT 1;
```

### 2. Search Problems
```sql
SELECT * FROM problems
WHERE to_tsvector('english', title || ' ' || description) 
      @@ to_tsquery('english', 'array & sum')
ORDER BY acceptance_rate DESC;
```

### 3. Filter by Tags
```sql
SELECT * FROM problems
WHERE tags && ARRAY['array', 'sorting']
  AND difficulty = 'medium';
```

### 4. Company-Specific Problems (Future)
```sql
SELECT * FROM problems
WHERE 'google' = ANY(companies);
```

### 5. Recommended Problems (Based on user's weak areas)
```sql
-- Find categories where user has low acceptance rate
WITH user_stats AS (
  SELECT 
    p.category,
    COUNT(*) as attempted,
    SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as solved
  FROM submissions s
  JOIN problems p ON s.problem_id = p.id
  WHERE s.user_id = $1
  GROUP BY p.category
)
SELECT * FROM problems
WHERE category IN (
  SELECT category FROM user_stats 
  WHERE solved::float / attempted < 0.5
  ORDER BY attempted DESC
  LIMIT 3
)
ORDER BY RANDOM()
LIMIT 5;
```

---

## 📊 When to Use What?

### Use JSON Files When:
- ✅ Less than 100 problems total
- ✅ Static content (rarely updated)
- ✅ Simple listing (no filtering/search)
- ✅ Want version control for problems
- ✅ Prototyping/testing

### Use Database When:
- ✅ More than 100 problems
- ✅ Need filtering/search/pagination
- ✅ Dynamic features (problem of the day, recommendations)
- ✅ Track problem statistics (submissions, acceptance rate)
- ✅ Production-ready application
- ✅ Multi-user platform

---

## 🎯 Recommendation for Your App

### Current State:
- PF Track: 85 problems ✅ (Keep JSON for now)
- PF Lab: 0 problems → Will add 50-100 ⚠️
- OOP: 0 problems → Will add 80-120 ⚠️
- DSA: 0 problems → Will add 200+ ⚠️

**Total Expected**: 415-505 problems

### Strategy:
1. **Keep JSON for PF track** (already working)
2. **Migrate to database when you add PF Lab** (crossing 150 problems)
3. **Use import script** to move existing PF problems to database
4. **Add new tracks directly to database**

---

## 🛠️ Quick Migration Checklist

- [ ] Create `problems` table in Supabase
- [ ] Run import script for existing PF problems
- [ ] Update `Problems.jsx` to fetch from database
- [ ] Add pagination component
- [ ] Test filtering and search
- [ ] Keep JSON files as backup (for now)
- [ ] Add new PF Lab problems directly to database
- [ ] Celebrate! 🎉

---

## 💡 Best of Both Worlds: Hybrid Approach

### Keep JSON for Backups
```
problems/
├── json/ (backup, version controlled)
│   └── pf-problems.json
└── database (production)
    └── Supabase `problems` table
```

### Sync Script
```javascript
// Export from database to JSON (for backup)
async function exportToJSON() {
  const { data } = await supabase.from('problems').select('*');
  fs.writeFileSync('problems/backup.json', JSON.stringify(data, null, 2));
}
```

---

## 📚 Summary

**For 500+ questions with test cases:**

1. **Store in Database** ✅ (Recommended)
   - Use Supabase `problems` table
   - JSONB for test cases
   - Enables search, filtering, pagination
   - Scales infinitely

2. **Keep JSON as Backup** ✅
   - Version control
   - Easy manual editing
   - Export from database weekly

3. **Test Cases in JSONB** ✅
   - Flexible structure
   - Efficient storage
   - Easy to query

**JSON is NOT a bad option**, but database is better for 500+ problems with advanced features!

---

**Made with 💙 by Saim**

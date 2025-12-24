# Today's Tasks - Action Plan
**Date**: December 24, 2025

---

## 🎯 Main Objectives

1. ✅ **Document Current Features** → **DONE** ([FEATURES.md](./FEATURES.md))
2. ⏳ **Implement Mock Exam System** (3 hours, 3 questions, anti-cheating)
3. ⏳ **Add PF Lab Questions** (50-100 problems)
4. ⏳ **Plan Question Storage Migration** (JSON → Database)
5. ⏳ **Add OOP & DSA Questions** (optional, if time permits)

---

## 📋 Step-by-Step Plan

### Phase 1: Database Setup (30 mins)

#### 1.1 Create Mock Exam Tables
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy SQL from `MOCK_EXAM_IMPLEMENTATION.md` (lines 17-140)
- [ ] Run the SQL to create tables:
  - `mock_exams`
  - `exam_questions`
  - `exam_attempts`
  - `exam_submissions`
- [ ] Verify tables created successfully

#### 1.2 Create Problems Table
- [ ] Copy SQL from `QUESTION_STORAGE_GUIDE.md` (lines 65-115)
- [ ] Run the SQL to create `problems` table
- [ ] Create indexes for performance
- [ ] Set up Row Level Security policies

---

### Phase 2: Mock Exam Implementation (3-4 hours)

#### 2.1 Create Anti-Cheating Hook
- [ ] Create file: `src/hooks/useExamGuard.js`
- [ ] Copy code from `MOCK_EXAM_IMPLEMENTATION.md` (lines 149-300)
- [ ] Test violations logging:
  - Tab switching
  - Copy/paste detection
  - Fullscreen monitoring
  - DevTools detection

#### 2.2 Create Timer Components
- [ ] Create file: `src/components/ExamTimer.jsx`
- [ ] Copy code from `MOCK_EXAM_IMPLEMENTATION.md` (lines 304-366)
- [ ] Add warning animations
- [ ] Test countdown functionality

#### 2.3 Create Mock Exam Page
- [ ] Create file: `src/pages/MockExam.jsx`
- [ ] Copy skeleton from `MOCK_EXAM_IMPLEMENTATION.md` (lines 417-523)
- [ ] Implement exam flow:
  - Start exam screen
  - Question navigation (1 → 2 → 3)
  - Code editor integration
  - Submit functionality
  - Auto-submit on timeout

#### 2.4 Create Exam Results Page
- [ ] Create file: `src/pages/ExamResults.jsx`
- [ ] Show:
  - Total score
  - Per-question breakdown
  - Time taken
  - Cheating flags (if any)
  - Solutions (after exam ends)

#### 2.5 Add Routes
- [ ] Update `src/App.jsx`:
```javascript
<Route path="/mock-exam/:examId" element={<MockExam />} />
<Route path="/exam-results/:attemptId" element={<ExamResults />} />
<Route path="/mock-exams" element={<MockExamsList />} />
```

---

### Phase 3: PF Lab Questions (2-3 hours)

#### 3.1 Create Question Template
Use this template for each question:

```json
{
  "id": "pf-lab-001",
  "track": "pf-lab",
  "category": "Loops",
  "title": "Print Pattern",
  "difficulty": "easy",
  "description": "Write a program to print a specific pattern...",
  "input_format": "Single integer n",
  "output_format": "Pattern with n rows",
  "constraints": "1 <= n <= 50",
  "sample_test_cases": [
    {
      "input": "5",
      "output": "...",
      "explanation": "..."
    }
  ],
  "hidden_test_cases": [
    {
      "input": "3",
      "output": "..."
    }
  ],
  "starter_code_cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
  "points": 10,
  "time_limit_ms": 1000,
  "memory_limit_mb": 256,
  "tags": ["loops", "patterns"]
}
```

#### 3.2 Categories for PF Lab
Create questions for each category:

1. **Basic I/O** (10 problems)
   - Input/output operations
   - Data type conversions
   - Formatted output

2. **Control Structures** (15 problems)
   - If-else statements
   - Switch cases
   - Nested conditions

3. **Loops** (15 problems)
   - For loops
   - While loops
   - Nested loops
   - Pattern printing

4. **Arrays** (10 problems)
   - Array initialization
   - Array traversal
   - Basic array operations

5. **Functions** (10 problems)
   - Function declaration
   - Parameter passing
   - Return values

**Total**: 60 problems

#### 3.3 Quick Generation Strategy

**Option A: Manual Creation** (Slower but quality guaranteed)
- Create 10-15 problems per day
- Test each problem thoroughly
- Takes 3-4 days

**Option B: AI-Assisted Generation** (Faster)
- Use Gemini/ChatGPT to generate problems
- Review and edit each problem
- Test all problems
- Takes 1-2 days

**Recommended**: Option B with manual review

Example prompt for AI:
```
Generate 10 PF Lab programming problems for the "Loops" category.
Each problem should:
- Be beginner-friendly
- Have clear input/output format
- Include 1 sample test case with explanation
- Include 2 hidden test cases
- Have starter code template in C++

Format as JSON following this structure: {...}
```

---

### Phase 4: AI Code Similarity Detection (1-2 hours)

#### 4.1 Setup Gemini API
- [ ] Get API key from Google AI Studio
- [ ] Add to `.env`:
```
VITE_GEMINI_API_KEY=your_key_here
```

#### 4.2 Create Detection Service
- [ ] Create file: `src/lib/aiDetection.js`
- [ ] Copy code from `MOCK_EXAM_IMPLEMENTATION.md` (lines 370-415)
- [ ] Test with sample submissions

#### 4.3 Integrate with Exam Submissions
- [ ] Run AI detection after each submission (async)
- [ ] Store similarity score in database
- [ ] Flag suspicious submissions (>85% similarity)
- [ ] Don't block submission - just log

---

### Phase 5: Testing & Polish (1 hour)

#### 5.1 Test Mock Exam Flow
- [ ] Create test exam with 3 questions
- [ ] Start exam → fullscreen activates
- [ ] Try to paste code → error shown
- [ ] Switch tabs → warning shown
- [ ] Submit answers
- [ ] Check results page

#### 5.2 Test Anti-Cheating
- [ ] Open DevTools → logged
- [ ] Switch tabs 5 times → count increases
- [ ] Try to paste → blocked
- [ ] Exit fullscreen → warning + auto re-enter

#### 5.3 Database Checks
- [ ] Verify `exam_attempts` created
- [ ] Check `exam_submissions` saved
- [ ] Confirm violations logged
- [ ] Test AI similarity detection

---

## ⏰ Time Estimates

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Database Setup | 30 mins | 🔴 Critical |
| Anti-Cheating Hook | 1 hour | 🔴 Critical |
| Timer Components | 30 mins | 🔴 Critical |
| Mock Exam Page | 2 hours | 🔴 Critical |
| Exam Results Page | 1 hour | 🟡 Important |
| Add Routes | 15 mins | 🔴 Critical |
| PF Lab Questions (AI-assisted) | 2 hours | 🟡 Important |
| AI Detection Setup | 1 hour | 🟢 Nice to have |
| Testing & Polish | 1 hour | 🟡 Important |

**Total**: 8-9 hours

---

## 🎯 Realistic Goals for Today

### Must Complete (Core):
1. ✅ Database setup (30 mins)
2. ✅ Anti-cheating hook (1 hour)
3. ✅ Basic mock exam page (2 hours)
4. ✅ Timer components (30 mins)
5. ✅ Test basic flow (30 mins)

**Total**: ~4.5 hours → **ACHIEVABLE** ✅

### If Time Permits (Bonus):
6. Add exam results page (1 hour)
7. Create 20-30 PF Lab questions (1 hour)
8. AI detection setup (1 hour)

---

## 📚 Resources Created

1. ✅ **[FEATURES.md](./FEATURES.md)** - Complete feature list
2. ✅ **[MOCK_EXAM_IMPLEMENTATION.md](./MOCK_EXAM_IMPLEMENTATION.md)** - Detailed implementation guide
3. ✅ **[QUESTION_STORAGE_GUIDE.md](./QUESTION_STORAGE_GUIDE.md)** - Storage strategy comparison

---

## 🚀 Getting Started

### Immediate Next Steps:

1. **Open Supabase Dashboard**
   - Go to SQL Editor
   - Run the database setup scripts

2. **Create Files Structure**
   ```
   src/
   ├── hooks/
   │   └── useExamGuard.js (create this)
   ├── components/
   │   └── ExamTimer.jsx (create this)
   └── pages/
       ├── MockExam.jsx (create this)
       └── ExamResults.jsx (create this)
   ```

3. **Start with Database**
   - This is the foundation
   - Everything else depends on it
   - Takes only 30 minutes

4. **Then Build Components**
   - Start with `useExamGuard` hook
   - Then `ExamTimer` component
   - Finally `MockExam` page

---

## 💡 Tips

### For Question Generation:
- Use AI to generate, then manually verify
- Test each problem's starter code
- Ensure test cases cover edge cases
- Keep difficulty consistent

### For Anti-Cheating:
- Don't be too strict (it frustrates users)
- Log everything, but only flag obvious violations
- Give warnings instead of blocking
- Allow copy (but log it), block paste only

### For Database:
- Start with database setup FIRST
- Test queries in SQL editor before coding
- Use RLS policies for security
- Add indexes for performance

---

## ✅ Success Criteria

By end of day, you should have:
- [ ] Database tables created and tested
- [ ] Mock exam page that:
  - Starts in fullscreen
  - Blocks paste
  - Logs tab switches
  - Shows timer countdown
  - Submits code
- [ ] At least 1 complete mock exam with 3 questions
- [ ] Tested the full exam flow

**Bonus**:
- [ ] 20-30 PF Lab questions added
- [ ] AI similarity detection working
- [ ] Exam results page complete

---

## 🎮 Let's Build!

**Current Status**: Planning Complete ✅  
**Next Step**: Set up database tables

Ready to start? Let me know which part you want to tackle first! 🚀

---

**Made with 💙 by Saim**

# Vexilot - Features List

> **Last Updated**: December 24, 2025  
> **Version**: 1.0  
> **Platform**: Competitive Programming & Learning Platform

---

## 🎯 Core Features (Implemented)

### 1. Authentication & User Management
- ✅ **Email-based Authentication** via Supabase
- ✅ **User Profiles** with customizable information
  - Avatar upload
  - Full name, username, bio
  - Social media links (LinkedIn, GitHub, Twitter, Portfolio)
- ✅ **University Onboarding** - First-time user setup flow
- ✅ **Profile Privacy Settings**

### 2. Learning Hub
- ✅ **Multi-Track Learning System**
  - Programming Fundamentals (PF) - **85 problems, 45 dry runs**
  - PF Lab Practice - **Coming Soon**
  - Object-Oriented Programming (OOP) - **Coming Soon**
  - Data Structures & Algorithms (DSA) - **Coming Soon**
  
- ✅ **Problem Categories for PF Track**:
  - Arrays (1D, 2D, 3D)
  - Pointers
  - Recursion
  - Functions
  - Dynamic Memory Allocation
  - Bitwise Operations
  - Dry Run Challenges

### 3. Code Editor & Execution
- ✅ **Monaco Editor Integration** - Industry-standard code editor
- ✅ **Real-time Code Execution** 
- ✅ **Test Case Validation**
  - Sample test cases (visible)
  - Hidden test cases (for validation)
- ✅ **Syntax Highlighting** for C++
- ✅ **Starter Code Templates** for each problem

### 4. Gamification & Progress Tracking
- ✅ **Points System** - Earn points for solving problems
- ✅ **Daily Streak Tracking** - Maintain consistency
- ✅ **Leaderboard System**
  - Global rankings
  - Score-based sorting
  - Real-time updates
  - Top 3 special badges (Gold, Silver, Bronze)
- ✅ **User Rankings** - See your position among peers

### 5. Social Features
- ✅ **User Discovery** - Find and connect with other learners
- ✅ **Follow System**
  - Follow/Unfollow users
  - Follower count tracking
  - Following count tracking
- ✅ **Public User Profiles** - View other users' stats and progress
- ✅ **Followers/Following Pages** - See who follows you and who you follow

### 6. Problem Solving Interface
- ✅ **Difficulty Levels** - Easy, Medium, Hard
- ✅ **Problem Descriptions** with:
  - Input/Output format
  - Constraints
  - Sample test cases with explanations
- ✅ **Submission History** - Track all your attempts
- ✅ **Status Tracking** - Accepted, Wrong Answer, Runtime Error, etc.

### 7. UI/UX Features
- ✅ **Modern Dark Theme** - Premium aesthetic design
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Mobile Blocker** - Redirects mobile users to desktop
- ✅ **Smooth Animations** - Framer Motion powered
- ✅ **Loading States** - Professional loading indicators
- ✅ **Error Handling** - User-friendly error messages

### 8. Database & Backend
- ✅ **Supabase Integration**
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
- ✅ **Data Models**:
  - `profiles` - User information
  - `submissions` - Code submissions
  - `follows` - Social connections
  - `problems` - Problem metadata

### 9. Profile Customization
- ✅ **Edit Profile Page**
  - Update personal information
  - Add social media links
  - Upload avatar
  - Change bio
- ✅ **Stats Display**
  - Problems solved
  - Total score
  - Current streak
  - Total submissions
  - Global rank

### 10. Navigation & Routing
- ✅ **React Router** - Client-side routing
- ✅ **Protected Routes** - Authentication guards
- ✅ **Clean URLs** - User-friendly paths
- ✅ **Navigation Header** with:
  - Learning Hub access
  - Leaderboard link
  - Profile link
  - Quick stats display

---

## 🚀 Planned Features (Today's Tasks)

### 11. Mock Exam System
- ⏳ **3-Hour Exam Mode**
  - Total duration: 3 hours
  - 3 questions (1 hour each)
  - Auto-submit when time expires
  
- ⏳ **Question Timer**
  - Individual 1-hour timer per question
  - Warning at 10 minutes remaining
  - Auto-move to next question when time up
  
- ⏳ **Anti-Copy-Paste Protection**
  - Detect and block paste events
  - Show error message on paste attempt
  - Track copy attempts (log for review)
  
- ⏳ **Anti-Cheating System**
  - AI Code Similarity Detector
  - Tab/Window switching detection
  - Screen recording prevention
  - Fullscreen mode enforcement
  - Browser console access detection
  
- ⏳ **Exam Results**
  - Immediate score display
  - Detailed breakdown per question
  - Time taken per question
  - Cheating flags (if any detected)

### 12. PF Lab Questions
- ⏳ **Lab Exercise Categories**
  - Basic I/O operations
  - Control structures
  - Array manipulations
  - Loop patterns
  - Function implementations
  
- ⏳ **Estimated Volume**: 50-100 problems
- ⏳ **Difficulty Mix**: 60% Easy, 30% Medium, 10% Hard

### 13. OOP Questions
- ⏳ **Topics to Cover**
  - Classes & Objects
  - Constructors & Destructors
  - Inheritance
  - Polymorphism
  - Encapsulation
  - Abstract classes
  - Virtual functions
  
- ⏳ **Estimated Volume**: 80-120 problems

### 14. DSA Questions
- ⏳ **Data Structures**
  - Linked Lists
  - Stacks
  - Queues
  - Trees (Binary, BST, AVL)
  - Graphs
  - Hash Tables
  
- ⏳ **Algorithms**
  - Sorting algorithms
  - Searching algorithms
  - Dynamic Programming
  - Greedy algorithms
  - Graph algorithms (BFS, DFS, Dijkstra)
  
- ⏳ **Estimated Volume**: 200+ problems

---

## 📊 Storage Strategy Discussion

### Current Storage Method: JSON Files
**Advantages**:
- ✅ Simple to implement and manage
- ✅ Version control friendly (Git)
- ✅ Easy to edit and update
- ✅ No database overhead for static content
- ✅ Fast loading (can be cached)

**Disadvantages**:
- ❌ Not scalable for 500+ problems
- ❌ No dynamic filtering/search
- ❌ Have to load entire files
- ❌ Difficult to manage test cases at scale

### Recommended: Hybrid Approach

#### **Option 1: Supabase Database (Recommended)**
Store problems in a dedicated `problems` table:

```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY,
  track VARCHAR(50), -- 'pf', 'oop', 'dsa', 'pf-lab'
  category VARCHAR(100), -- 'Arrays', 'Pointers', etc.
  title VARCHAR(255),
  difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  description TEXT,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  starter_code TEXT,
  points INTEGER,
  sample_test_cases JSONB, -- Array of test cases
  hidden_test_cases JSONB, -- Array of test cases
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**How LeetCode Does It**:
- Problems stored in database
- Test cases in JSONB format (like your current structure)
- Separate table for user submissions
- Efficient indexing for fast queries
- Caching layer for frequently accessed problems

**Benefits**:
- ✅ Scalable to 1000+ problems
- ✅ Dynamic filtering and search
- ✅ Real-time updates
- ✅ Better performance with pagination
- ✅ Can add features like: problem of the day, random questions, etc.

#### **Option 2: Keep JSON + Database Hybrid**
- Store **problem metadata** in database (title, difficulty, category, points)
- Store **test cases** in JSON files or S3/CDN
- Load test cases on-demand when user attempts problem

**Benefits**:
- ✅ Best of both worlds
- ✅ Metadata searchable
- ✅ Test cases cached
- ✅ Reduced database size

---

## 🎨 Mock Exam Implementation Plan

### Phase 1: Database Schema
```sql
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  duration_minutes INTEGER DEFAULT 180,
  track VARCHAR(50), -- 'pf', 'oop', 'dsa'
  created_at TIMESTAMP
);

CREATE TABLE exam_questions (
  id UUID PRIMARY KEY,
  exam_id UUID REFERENCES mock_exams(id),
  problem_id UUID REFERENCES problems(id),
  question_number INTEGER,
  time_limit_minutes INTEGER DEFAULT 60,
  points INTEGER
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  exam_id UUID REFERENCES mock_exams(id),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  total_score INTEGER,
  status VARCHAR(50), -- 'in_progress', 'completed', 'flagged'
  cheating_flags JSONB, -- Array of detected violations
  tab_switches INTEGER DEFAULT 0,
  copy_attempts INTEGER DEFAULT 0
);

CREATE TABLE exam_submissions (
  id UUID PRIMARY KEY,
  attempt_id UUID REFERENCES exam_attempts(id),
  question_id UUID REFERENCES exam_questions(id),
  code TEXT,
  submitted_at TIMESTAMP,
  score INTEGER,
  time_taken_minutes INTEGER,
  test_cases_passed INTEGER,
  test_cases_total INTEGER
);
```

### Phase 2: Anti-Cheating Features

#### **1. Copy-Paste Detection**
```javascript
// Disable paste in code editor
editor.onKeyDown((e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    e.preventDefault();
    showError('Paste is disabled during exams!');
    logCheatingAttempt('paste_attempt');
  }
});

// Also block context menu paste
editor.onContextMenu((e) => {
  e.preventDefault();
});
```

#### **2. Tab Switching Detection**
```javascript
// Detect when user leaves the page
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    incrementTabSwitchCount();
    showWarning('Tab switching detected! This attempt is logged.');
  }
});

// Detect window blur
window.addEventListener('blur', () => {
  logCheatingAttempt('tab_switch');
});
```

#### **3. AI Code Similarity Detection**
```javascript
// After submission, check against:
// 1. Other users' submissions
// 2. Known online solutions
// 3. Previous submissions

async function checkCodeSimilarity(code, problemId) {
  // Option 1: Use Gemini API
  const response = await geminiApi.detectPlagiarism({
    code,
    problemId,
    language: 'cpp'
  });
  
  // Option 2: Use local similarity algorithm
  const similarity = calculateJaccardSimilarity(code, otherSubmissions);
  
  if (similarity > 0.85) {
    flagSubmission('high_similarity');
  }
}
```

#### **4. Fullscreen Enforcement**
```javascript
// Request fullscreen on exam start
function startExam() {
  document.documentElement.requestFullscreen();
  
  // Monitor fullscreen exit
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      showWarning('Please stay in fullscreen mode!');
      logCheatingAttempt('fullscreen_exit');
    }
  });
}
```

#### **5. Console Detection**
```javascript
// Detect if DevTools is open
const devToolsDetector = {
  threshold: 160,
  check: function() {
    if (window.outerWidth - window.innerWidth > this.threshold ||
        window.outerHeight - window.innerHeight > this.threshold) {
      logCheatingAttempt('devtools_opened');
      showWarning('Developer tools detected!');
    }
  }
};

setInterval(() => devToolsDetector.check(), 1000);
```

---

## 📝 Question Storage Best Practices

### Recommended Structure (JSON)
```json
{
  "id": "pf-lab-001",
  "track": "pf-lab",
  "category": "Loops",
  "title": "Print Pyramid Pattern",
  "difficulty": "easy",
  "description": "Write a program to print a pyramid pattern...",
  "inputFormat": "Single integer n (pyramid height)",
  "outputFormat": "Pyramid pattern",
  "constraints": "1 <= n <= 50",
  "sampleTestCases": [
    {
      "input": "5",
      "output": "    *\n   ***\n  *****\n *******\n*********",
      "explanation": "Pyramid with 5 rows"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "3",
      "output": "  *\n ***\n*****"
    }
  ],
  "starterCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
  "points": 10,
  "timeLimit": 1000,
  "memoryLimit": 256
}
```

### Migrate to Database When:
- You have 100+ problems per track
- Need advanced search/filtering
- Want to implement: problem of the day, random practice, personalized recommendations

---

## 🔮 Future Enhancements

- **AI Interview Mode** - Voice-based code review with Gemini API
- **Contest Mode** - Timed competitions with live leaderboards
- **Discussion Forums** - Per-problem discussion threads
- **Video Solutions** - Tutorial videos for each problem
- **Badges & Achievements** - Unlock rewards for milestones
- **Daily Challenges** - Streak-based daily problems
- **Company Prep** - Problems organized by company
- **Mobile App** - React Native version

---

**Made with 💙 by Saim**

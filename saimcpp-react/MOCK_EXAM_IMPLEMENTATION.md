# Mock Exam System - Implementation Guide

> **Objective**: Build a 3-hour mock exam with 3 questions, anti-cheating measures, and AI detection

---

## 🎯 System Overview

### Exam Structure
- **Total Duration**: 3 hours (180 minutes)
- **Questions**: 3 programming problems
- **Time Per Question**: 1 hour (60 minutes) - soft limit
- **Scoring**: Points based on test cases passed
- **Anti-Cheating**: Multiple layers of protection

---

## 📊 Database Schema

### 1. Create Migration Files

Run these SQL commands in Supabase:

```sql
-- Mock Exams Table
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  track VARCHAR(50) NOT NULL, -- 'pf', 'oop', 'dsa', 'pf-lab'
  duration_minutes INTEGER DEFAULT 180,
  total_points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exam Questions (Links exam to problems)
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  problem_id VARCHAR(255) NOT NULL, -- Reference to problem (from JSON or DB)
  question_number INTEGER NOT NULL,
  time_limit_minutes INTEGER DEFAULT 60,
  points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Attempts (User's exam sessions)
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  current_question INTEGER DEFAULT 1,
  total_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned', 'flagged'
  
  -- Anti-Cheating Metrics
  tab_switches INTEGER DEFAULT 0,
  copy_attempts INTEGER DEFAULT 0,
  paste_attempts INTEGER DEFAULT 0,
  fullscreen_exits INTEGER DEFAULT 0,
  devtools_detected BOOLEAN DEFAULT false,
  suspicious_activity JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  browser_info JSONB,
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exam Submissions (Per question submissions)
CREATE TABLE exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  
  -- Code & Results
  code TEXT NOT NULL,
  language VARCHAR(50) DEFAULT 'cpp',
  status VARCHAR(50), -- 'accepted', 'wrong_answer', 'runtime_error', 'time_limit'
  score INTEGER DEFAULT 0,
  
  -- Test Cases
  test_cases_passed INTEGER DEFAULT 0,
  test_cases_total INTEGER DEFAULT 0,
  test_case_results JSONB, -- Detailed results per test case
  
  -- Timing
  submitted_at TIMESTAMP DEFAULT NOW(),
  time_taken_seconds INTEGER,
  
  -- AI Detection
  similarity_score FLOAT, -- 0.0 to 1.0
  similarity_flags JSONB, -- List of similar submissions
  ai_generated_probability FLOAT, -- 0.0 to 1.0 (if detected)
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX idx_exam_submissions_attempt ON exam_submissions(attempt_id);
CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);

-- Row Level Security (RLS)
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Users can only view/edit their own attempts
CREATE POLICY "Users can view own attempts" ON exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts" ON exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON exam_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only view/create submissions for their attempts
CREATE POLICY "Users can view own submissions" ON exam_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exam_attempts 
      WHERE exam_attempts.id = exam_submissions.attempt_id 
      AND exam_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own submissions" ON exam_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts 
      WHERE exam_attempts.id = exam_submissions.attempt_id 
      AND exam_attempts.user_id = auth.uid()
    )
  );
```

---

## 🛡️ Anti-Cheating Implementation

### Component: `ExamGuard.jsx`

```jsx
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useExamGuard(attemptId, isExamActive) {
  const violationsRef = useRef({
    tab_switches: 0,
    copy_attempts: 0,
    paste_attempts: 0,
    fullscreen_exits: 0,
    devtools_detected: false
  });

  // Log violation to database
  const logViolation = useCallback(async (type, details = {}) => {
    if (!attemptId || !isExamActive) return;

    violationsRef.current[type]++;
    
    await supabase
      .from('exam_attempts')
      .update({
        [type]: violationsRef.current[type],
        suspicious_activity: supabase
          .raw(`suspicious_activity || ?`, [{
            type,
            timestamp: new Date().toISOString(),
            details
          }])
      })
      .eq('id', attemptId);

    // Show warning to user
    showWarning(getWarningMessage(type));
  }, [attemptId, isExamActive]);

  // Tab switching detection
  useEffect(() => {
    if (!isExamActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switches', {
          action: 'tab_hidden'
        });
      }
    };

    const handleBlur = () => {
      logViolation('tab_switches', {
        action: 'window_blur'
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamActive, logViolation]);

  // Copy/Paste detection
  useEffect(() => {
    if (!isExamActive) return;

    const handleCopy = (e) => {
      logViolation('copy_attempts', {
        selection_length: window.getSelection().toString().length
      });
    };

    const handlePaste = (e) => {
      e.preventDefault();
      logViolation('paste_attempts', {
        clipboard_length: e.clipboardData?.getData('text')?.length || 0
      });
      showError('Paste is disabled during exams!');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isExamActive, logViolation]);

  // Fullscreen monitoring
  useEffect(() => {
    if (!isExamActive) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('fullscreen_exits');
        
        // Auto re-request fullscreen after 3 seconds
        setTimeout(() => {
          document.documentElement.requestFullscreen?.();
        }, 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isExamActive, logViolation]);

  // DevTools detection
  useEffect(() => {
    if (!isExamActive) return;

    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        logViolation('devtools_detected', {
          width_diff: window.outerWidth - window.innerWidth,
          height_diff: window.outerHeight - window.innerHeight
        });
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, logViolation]);

  // Request fullscreen on start
  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.();
  }, []);

  return {
    violations: violationsRef.current,
    requestFullscreen
  };
}

function showWarning(message) {
  // Implement toast notification
  console.warn('EXAM WARNING:', message);
}

function showError(message) {
  // Implement error toast
  console.error('EXAM ERROR:', message);
}

function getWarningMessage(type) {
  const messages = {
    tab_switches: '⚠️ Tab switching detected! This is being logged.',
    copy_attempts: '⚠️ Copy activity detected!',
    paste_attempts: '❌ Paste is disabled during exams!',
    fullscreen_exits: '⚠️ Please stay in fullscreen mode!',
    devtools_detected: '⚠️ Developer tools detected!'
  };
  return messages[type] || 'Suspicious activity detected!';
}
```

---

## ⏱️ Timer Component

### Component: `ExamTimer.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function ExamTimer({ 
  startTime, 
  duration, 
  onTimeUp,
  warningThreshold = 600 // 10 minutes in seconds
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startTime)) / 1000);
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setTimeLeft(remaining);
        setIsWarning(remaining <= warningThreshold);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeUp, warningThreshold]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
      isWarning 
        ? 'bg-red-500/10 text-red-500' 
        : 'bg-blue-500/10 text-blue-500'
    }`}>
      <Clock className="h-5 w-5" />
      <span className="text-lg font-mono font-bold">
        {formatTime(timeLeft)}
      </span>
      {isWarning && (
        <span className="text-sm ml-2 animate-pulse">
          ⚠️ Time running out!
        </span>
      )}
    </div>
  );
}

export function QuestionTimer({ timeLimit, questionNumber, onTimeUp }) {
  // Similar to ExamTimer but for individual questions
  // Shows progress bar and remaining time
  // Can be optional - doesn't force submission
}
```

---

## 🧠 AI Code Similarity Detection

### Using Gemini API

```javascript
// lib/aiDetection.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function detectCodeSimilarity(code, problemId, language = 'cpp') {
  try {
    // Get other submissions for the same problem
    const { data: otherSubmissions } = await supabase
      .from('exam_submissions')
      .select('code, attempt_id')
      .eq('question_id', problemId)
      .neq('attempt_id', currentAttemptId)
      .limit(50);

    // Use Gemini to analyze similarity
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
You are a code plagiarism detector. Analyze the following ${language} code submission 
and determine if it's suspiciously similar to any of the provided reference codes.

Consider:
1. Variable naming patterns
2. Logic flow and structure
3. Comment patterns
4. Unusual similarities beyond standard solutions

Target Code:
\`\`\`${language}
${code}
\`\`\`

Reference Codes:
${otherSubmissions.map((s, i) => `
Code ${i + 1}:
\`\`\`${language}
${s.code}
\`\`\`
`).join('\n')}

Respond in JSON format:
{
  "is_suspicious": boolean,
  "similarity_score": number (0-1),
  "most_similar_submission": number (index or null),
  "reasoning": string,
  "confidence": number (0-1)
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    return analysis;
  } catch (error) {
    console.error('AI detection error:', error);
    return null;
  }
}

// Alternative: Simple Jaccard Similarity (no API needed)
export function calculateJaccardSimilarity(code1, code2) {
  // Tokenize code
  const tokens1 = new Set(code1.toLowerCase().split(/\W+/));
  const tokens2 = new Set(code2.toLowerCase().split(/\W+/));

  // Calculate Jaccard index
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}
```

---

## 🎮 Exam Flow

### Page: `MockExam.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useExamGuard } from '../hooks/useExamGuard';
import { ExamTimer } from '../components/ExamTimer';
import MonacoEditor from '@monaco-editor/react';

export default function MockExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [code, setCode] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Fetch exam details
  const { data: exam } = useQuery({
    queryKey: ['mock-exam', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mock_exams')
        .select(`
          *,
          exam_questions (
            *,
            problem:problem_id
          )
        `)
        .eq('id', examId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Anti-cheating guards
  const { violations, requestFullscreen } = useExamGuard(attemptId, isExamStarted);

  // Start exam
  const startExam = async () => {
    // Create exam attempt
    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: user.id,
        exam_id: examId,
        browser_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      })
      .select()
      .single();

    if (error) throw error;

    setAttemptId(data.id);
    setIsExamStarted(true);
    requestFullscreen();
  };

  // Submit code for current question
  const submitCode = async () => {
    // Run test cases and submit
    // ... implementation
  };

  // Auto-submit when time's up
  const handleTimeUp = async () => {
    await submitCode();
    setIsExamStarted(false);
    navigate(`/exam-results/${attemptId}`);
  };

  if (!isExamStarted) {
    return (
      <ExamInstructions 
        exam={exam} 
        onStart={startExam} 
      />
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with timer */}
      <div className="border-b p-4 flex justify-between items-center">
        <h1>{exam.name} - Question {currentQuestion}/3</h1>
        <ExamTimer 
          startTime={attemptStartTime}
          duration={exam.duration_minutes * 60}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Problem + Editor */}
      <div className="flex-1 grid grid-cols-2">
        {/* Problem description */}
        <div className="p-6 overflow-auto">
          {/* Problem details */}
        </div>

        {/* Code editor */}
        <div className="border-l">
          <MonacoEditor
            height="100%"
            language="cpp"
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              contextmenu: false, // Disable right-click menu
            }}
          />
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="border-t p-4 flex justify-between">
        <button disabled={currentQuestion === 1}>Previous</button>
        <button onClick={submitCode}>Submit Question</button>
        <button onClick={() => setCurrentQuestion(q => q + 1)}>
          Next Question
        </button>
      </div>
    </div>
  );
}
```

---

## 📝 Best Practices

### 1. Store Questions in Database
- Migrate from JSON to Supabase `problems` table
- Use JSONB for test cases
- Enable full-text search on descriptions

### 2. AI Detection Strategy
- Run similarity check AFTER submission (async)
- Don't block submission - flag for review
- Use Gemini API for advanced detection
- Fallback to Jaccard similarity if API fails

### 3. User Experience
- Show clear warnings, not blocking errors
- Allow copy (log it), but block paste
- Give 10-minute warning before time up
- Auto-save code every 30 seconds

### 4. Scoring System
- Partial credit for passed test cases
- Time bonus for early submission
- Penalty for excessive violations
- Formula: `score = (passed/total * points) - (violations * 2)`

---

## 🚀 Next Steps

1. ✅ Create database tables (run SQL above)
2. ⏳ Build `ExamGuard` hook
3. ⏳ Create `MockExam.jsx` page
4. ⏳ Implement timer components
5. ⏳ Add AI similarity detection
6. ⏳ Create exam results page
7. ⏳ Test with mock data
8. ⏳ Add PF Lab questions
9. ⏳ Populate exam questions
10. ⏳ Deploy and test

---

**Implementation Time Estimate**: 2-3 days
**Priority**: High (Required for portfolio)

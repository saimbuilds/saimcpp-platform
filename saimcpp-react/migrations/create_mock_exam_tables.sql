-- Mock Exam System Database Schema

-- 1. Mock Exams Table
CREATE TABLE IF NOT EXISTS mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 180,
  total_marks INT DEFAULT 75,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Exam Questions Table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  marks INT DEFAULT 25,
  time_estimate_minutes INT DEFAULT 60,
  
  -- Markdown content with grids
  content TEXT NOT NULL,
  
  starter_code TEXT,
  
  -- Test cases as JSONB
  visible_test_cases JSONB DEFAULT '[]'::jsonb,
  hidden_test_cases JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(exam_id, question_number)
);

-- 3. Exam Attempts Table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  time_taken_minutes INT,
  
  -- Anti-cheating violations
  violations JSONB DEFAULT '{
    "tabSwitch": 0,
    "copyPaste": 0,
    "fullscreen": 0,
    "devTools": 0
  }'::jsonb,
  
  score INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in-progress', -- 'in-progress', 'submitted', 'auto-submitted'
  
  UNIQUE(user_id, exam_id)
);

-- 4. Exam Submissions Table (per question)
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
  
  code TEXT,
  output TEXT,
  score INT DEFAULT 0,
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_attempt_id ON exam_submissions(attempt_id);

-- RLS Policies
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active exams and questions
CREATE POLICY "Anyone can view active exams"
  ON mock_exams FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view exam questions"
  ON exam_questions FOR SELECT
  USING (true);

-- Users can only see their own attempts
CREATE POLICY "Users can view own attempts"
  ON exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON exam_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only see their own submissions
CREATE POLICY "Users can view own submissions"
  ON exam_submissions FOR SELECT
  USING (attempt_id IN (
    SELECT id FROM exam_attempts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own submissions"
  ON exam_submissions FOR INSERT
  WITH CHECK (attempt_id IN (
    SELECT id FROM exam_attempts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own submissions"
  ON exam_submissions FOR UPDATE
  USING (attempt_id IN (
    SELECT id FROM exam_attempts WHERE user_id = auth.uid()
  ));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_exam_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mock_exams_updated_at
  BEFORE UPDATE ON mock_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_exam_updated_at();

-- Insert default exam
INSERT INTO mock_exams (title, description, duration_minutes, total_marks, is_active)
VALUES (
  'PF Lab Final Exam',
  'Comprehensive 3-hour final exam covering all PF Lab topics. Choose any 3 questions (25 marks each).',
  180,
  75,
  true
)
ON CONFLICT DO NOTHING;

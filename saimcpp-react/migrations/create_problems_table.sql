-- =====================================================
-- HYBRID QUESTION STORAGE - DATABASE SCHEMA
-- =====================================================
-- This creates the problems table for storing 500+ questions
-- Metadata in columns, test cases in JSONB format

-- Main Problems Table
CREATE TABLE IF NOT EXISTS problems (
  id VARCHAR(50) PRIMARY KEY,
  track VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT NOT NULL,
  
  -- Format & Constraints
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  
  -- Code Templates (Multi-language support)
  starter_code_cpp TEXT,
  starter_code_python TEXT,
  starter_code_java TEXT,
  
  -- Limits & Points
  time_limit_ms INTEGER DEFAULT 1000,
  memory_limit_mb INTEGER DEFAULT 256,
  points INTEGER NOT NULL DEFAULT 10,
  
  -- Test Cases (JSONB for flexibility)
  sample_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  hidden_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  premium_only BOOLEAN DEFAULT false,
  tags TEXT[],
  companies TEXT[],
  
  -- Stats (updated via triggers or application logic)
  total_submissions INTEGER DEFAULT 0,
  accepted_submissions INTEGER DEFAULT 0,
  acceptance_rate FLOAT GENERATED ALWAYS AS 
    (CASE WHEN total_submissions > 0 
     THEN CAST(accepted_submissions AS FLOAT) / total_submissions * 100
     ELSE 0 END) STORED,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR FAST QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_problems_track ON problems(track);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(track, category);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_problems_search ON problems 
  USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_problems_acceptance ON problems(acceptance_rate);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active problems" ON problems;
DROP POLICY IF EXISTS "Authenticated users can read all problems" ON problems;

-- Allow everyone to read active problems
CREATE POLICY "Anyone can read active problems" ON problems
  FOR SELECT USING (is_active = true);

-- Only authenticated users can read inactive problems (for testing)
CREATE POLICY "Authenticated users can read all problems" ON problems
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_problems_updated_at ON problems;
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (For testing)
-- =====================================================

INSERT INTO problems (
  id, track, category, title, difficulty, description,
  input_format, output_format, constraints,
  starter_code_cpp, points, tags,
  sample_test_cases, hidden_test_cases
) VALUES (
  'test-sample-001',
  'pf',
  'Arrays',
  'Sum of Array Elements',
  'easy',
  'Given an array of integers, find the sum of all elements.',
  'First line contains n (size of array). Second line contains n integers.',
  'Single integer representing the sum.',
  '1 <= n <= 1000, -10^6 <= arr[i] <= 10^6',
  '#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int arr[n];
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    // Your code here
    
    return 0;
}',
  10,
  ARRAY['arrays', 'basic', 'loops'],
  '[
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
  ]'::jsonb,
  '[
    {"id": 3, "input": "4\n-5 5 -3 3", "output": "0"},
    {"id": 4, "input": "1\n100", "output": "100"},
    {"id": 5, "input": "6\n1 1 1 1 1 1", "output": "6"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

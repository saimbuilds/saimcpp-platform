-- Fix favorites table to support string problem IDs
-- This allows favoriting problems with IDs like "pf-lab-2d arrays-easy-matrix..."

-- Drop existing table if it exists
DROP TABLE IF EXISTS favorites CASCADE;

-- Recreate with TEXT problem_id
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- Create index for faster lookups
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_problem_id ON favorites(problem_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

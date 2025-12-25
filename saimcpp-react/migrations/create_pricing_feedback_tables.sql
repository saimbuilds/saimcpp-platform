-- Create waitlist table for professional tier signups
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    category TEXT CHECK (category IN ('bug', 'feature', 'general')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Waitlist policies (anyone can insert, only authenticated can view)
CREATE POLICY "Anyone can join waitlist"
    ON waitlist FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Users can view waitlist"
    ON waitlist FOR SELECT
    TO authenticated
    USING (true);

-- Feedback policies (users can insert their own feedback, view their own)
CREATE POLICY "Users can submit feedback"
    ON feedback FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their feedback"
    ON feedback FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin can view all feedback (you'll access via Supabase dashboard)
CREATE POLICY "Admin can view all feedback"
    ON feedback FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.email = 'saimkhanwah@gmail.com'
        )
    );

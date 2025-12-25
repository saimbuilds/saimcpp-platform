-- Create ambassador applications table
CREATE TABLE IF NOT EXISTS ambassador_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    university TEXT NOT NULL,
    batch TEXT NOT NULL,
    why_join TEXT NOT NULL,
    expected_reach INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_created_at ON ambassador_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_status ON ambassador_applications(status);

-- Enable RLS
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit applications
CREATE POLICY "Anyone can submit ambassador application"
    ON ambassador_applications FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Only admin can view applications
CREATE POLICY "Admin can view all applications"
    ON ambassador_applications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.email = 'saimkhanwah@gmail.com'
        )
    );

-- Admin can update application status
CREATE POLICY "Admin can update applications"
    ON ambassador_applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.email = 'saimkhanwah@gmail.com'
        )
    );

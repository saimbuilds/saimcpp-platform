-- Fix Row-Level Security policies for exam_attempts and exam_submissions tables

-- exam_attempts table policies
-- Allow users to insert their own exam attempts
CREATE POLICY "Users can insert their own exam attempts"
ON exam_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own exam attempts
CREATE POLICY "Users can view their own exam attempts"
ON exam_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own exam attempts
CREATE POLICY "Users can update their own exam attempts"
ON exam_attempts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- exam_submissions table policies
-- Allow users to insert their own exam submissions
CREATE POLICY "Users can insert their own exam submissions"
ON exam_submissions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM exam_attempts
        WHERE exam_attempts.id = exam_submissions.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
);

-- Allow users to view their own exam submissions
CREATE POLICY "Users can view their own exam submissions"
ON exam_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exam_attempts
        WHERE exam_attempts.id = exam_submissions.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
);

-- Allow users to update their own exam submissions
CREATE POLICY "Users can update their own exam submissions"
ON exam_submissions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exam_attempts
        WHERE exam_attempts.id = exam_submissions.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM exam_attempts
        WHERE exam_attempts.id = exam_submissions.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
);

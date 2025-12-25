import { supabase } from '../src/lib/supabase.js';

async function checkRecentSubmission() {
    console.log('🔍 Checking recent exam submissions...\n');

    // Check exam attempts
    const { data: attempts, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);

    if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
    } else {
        console.log(`Found ${attempts?.length || 0} recent exam attempts:\n`);
        attempts?.forEach(attempt => {
            console.log(`Attempt ID: ${attempt.id}`);
            console.log(`User ID: ${attempt.user_id}`);
            console.log(`Status: ${attempt.status}`);
            console.log(`Score: ${attempt.score}`);
            console.log(`Started: ${attempt.started_at}`);
            console.log(`Submitted: ${attempt.submitted_at}`);
            console.log('---');
        });
    }

    // Check exam submissions
    const { data: submissions, error: submissionsError } = await supabase
        .from('exam_submissions')
        .select('*')
        .limit(10);

    if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
    } else {
        console.log(`\nFound ${submissions?.length || 0} exam submissions\n`);
    }

    // Check profiles with exam attempts
    console.log('🔍 Checking profiles with exam attempts...\n');
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, exam_score, exam_attempts, best_exam_score')
        .gt('exam_attempts', 0)
        .order('exam_score', { ascending: false });

    console.log(`Found ${profiles?.length || 0} profiles with exam attempts:\n`);
    profiles?.forEach(profile => {
        console.log(`${profile.full_name || profile.email}`);
        console.log(`  Exam Score: ${profile.exam_score}`);
        console.log(`  Attempts: ${profile.exam_attempts}`);
        console.log(`  Best Score: ${profile.best_exam_score}`);
        console.log('---');
    });
}

checkRecentSubmission();

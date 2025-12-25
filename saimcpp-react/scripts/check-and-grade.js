import { supabase } from '../src/lib/supabase.js';
import { gradeExamSubmissions } from '../src/lib/grading.js';

async function checkAndGrade() {
    console.log('🔍 Checking for ungraded exam attempts...\n');

    // Get all exam attempts
    const { data: allAttempts, error: allError } = await supabase
        .from('exam_attempts')
        .select('*');

    console.log(`Total exam attempts in database: ${allAttempts?.length || 0}\n`);

    if (allAttempts && allAttempts.length > 0) {
        allAttempts.forEach(attempt => {
            console.log(`Attempt ID: ${attempt.id}`);
            console.log(`User ID: ${attempt.user_id}`);
            console.log(`Status: ${attempt.status}`);
            console.log(`Score: ${attempt.score}`);
            console.log('---');
        });

        // Find ungraded attempts
        const ungraded = allAttempts.filter(a =>
            (a.status === 'submitted' || a.status === 'auto-submitted') &&
            (a.score === 0 || a.score === null)
        );

        console.log(`\nFound ${ungraded.length} ungraded attempts\n`);

        // Grade them
        for (const attempt of ungraded) {
            console.log(`Grading attempt ${attempt.id}...`);
            try {
                const result = await gradeExamSubmissions(supabase, attempt.id);
                console.log(`✅ Graded! Score: ${result.totalScore}\n`);
            } catch (err) {
                console.error(`❌ Error grading:`, err.message);
            }
        }
    } else {
        console.log('⚠️  No exam attempts found in database!');
        console.log('This means the exam submission is failing to create attempt records.\n');

        console.log('Checking profiles with exam_attempts > 0:');
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, exam_attempts')
            .gt('exam_attempts', 0);

        console.log(`Found ${profiles?.length || 0} profiles with exam_attempts set`);
        console.log('These were likely set manually and have no actual attempt records.\n');
    }
}

checkAndGrade();

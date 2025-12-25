import { supabase } from '../src/lib/supabase.js';

async function checkExamData() {
    console.log('🔍 Checking exam attempts...\n');

    // Get all exam attempts
    const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${attempts.length} recent attempts:\n`);
    attempts.forEach(attempt => {
        console.log(`ID: ${attempt.id}`);
        console.log(`User: ${attempt.user_id}`);
        console.log(`Status: ${attempt.status}`);
        console.log(`Score: ${attempt.score}`);
        console.log(`Submitted: ${attempt.submitted_at}`);
        console.log('---');
    });

    // Check profiles with exam attempts
    console.log('\n🔍 Checking profiles with exam attempts...\n');
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

checkExamData();

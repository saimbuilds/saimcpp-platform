import { supabase } from '../src/lib/supabase.js';

async function checkSubmissions() {
    console.log('🔍 Checking exam submissions...\n');

    // Get all exam submissions
    const { data: submissions, error } = await supabase
        .from('exam_submissions')
        .select('*')
        .limit(20);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${submissions?.length || 0} submissions:\n`);
    submissions?.forEach(sub => {
        console.log(`Attempt ID: ${sub.attempt_id}`);
        console.log(`Question ID: ${sub.question_id}`);
        console.log(`Score: ${sub.score}`);
        console.log(`Code length: ${sub.code?.length || 0} chars`);
        console.log('---');
    });

    // Check if there are attempts that should exist
    console.log('\n🔍 Checking for orphaned attempts...\n');
    const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('*');

    console.log(`Found ${attempts?.length || 0} exam attempts in database`);
}

checkSubmissions();

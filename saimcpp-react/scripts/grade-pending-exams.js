import { supabase } from '../src/lib/supabase.js';
import { gradeExamSubmissions } from '../src/lib/grading.js';

async function gradeAllPendingExams() {
    console.log('🔍 Finding ungraded exam attempts...');

    // Get all submitted exam attempts with score = 0
    const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('status', 'submitted')
        .eq('score', 0);

    if (error) {
        console.error('Error fetching attempts:', error);
        return;
    }

    console.log(`📝 Found ${attempts.length} ungraded attempts\n`);

    for (const attempt of attempts) {
        console.log(`Grading attempt ${attempt.id}...`);

        try {
            await gradeExamSubmissions(supabase, attempt.id);
            console.log(`✅ Graded successfully\n`);
        } catch (err) {
            console.error(`❌ Error grading attempt ${attempt.id}:`, err);
        }
    }

    console.log('\n🎉 Grading complete!');
}

gradeAllPendingExams();

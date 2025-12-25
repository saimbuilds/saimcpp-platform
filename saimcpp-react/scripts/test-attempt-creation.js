import { supabase } from '../src/lib/supabase.js';

async function testAttemptCreation() {
    console.log('🧪 Testing exam attempt creation...\n');

    // Get a test user (first user in profiles)
    const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(1);

    if (!users || users.length === 0) {
        console.error('No users found in profiles table');
        return;
    }

    const testUser = users[0];
    console.log(`Using test user: ${testUser.full_name || testUser.email} (${testUser.id})\n`);

    // Get a test exam
    const { data: exams } = await supabase
        .from('mock_exams')
        .select('id, title')
        .limit(1);

    if (!exams || exams.length === 0) {
        console.error('No exams found in mock_exams table');
        return;
    }

    const testExam = exams[0];
    console.log(`Using test exam: ${testExam.title} (${testExam.id})\n`);

    // Try to create an attempt
    console.log('Attempting to create exam_attempt record...\n');

    const { data, error } = await supabase
        .from('exam_attempts')
        .upsert({
            user_id: testUser.id,
            exam_id: testExam.id,
            status: 'in-progress',
            started_at: new Date().toISOString(),
            submitted_at: null,
            time_taken_minutes: null,
            score: 0
        }, {
            onConflict: 'user_id,exam_id'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to create attempt:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
    } else {
        console.log('✅ Successfully created attempt!');
        console.log('Attempt ID:', data.id);
        console.log('\nNow deleting test attempt...');

        await supabase
            .from('exam_attempts')
            .delete()
            .eq('id', data.id);

        console.log('✅ Test attempt deleted');
    }
}

testAttemptCreation();

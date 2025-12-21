// Script to reset a user's score
// Usage: node reset_user_score.js <roll_number>

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hvizuvovmdcjixqwmcgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXp1dm92bWRjaml4cXdtY2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM0NDYsImV4cCI6MjA4MTQ3OTQ0Nn0.pfvvAIKg0YCddlNAvyj8tmkqBAJH_eanSYAqNgXzxBo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function resetUserScore(rollNumber) {
    try {
        console.log(`🔍 Looking for user with roll number: ${rollNumber}`);

        // Find user by email (assuming roll number is part of email)
        const { data: profiles, error: searchError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', `%${rollNumber}%`);

        if (searchError) {
            console.error('❌ Error searching for user:', searchError.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('❌ No user found with that roll number');
            return;
        }

        const user = profiles[0];
        console.log(`✅ Found user: ${user.full_name} (${user.email})`);
        console.log(`📊 Current score: ${user.total_score}`);
        console.log(`📝 Problems solved: ${user.problems_solved}`);

        // Reset score to 0
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                total_score: 0,
                problems_solved: 0
            })
            .eq('id', user.id)
            .select();

        if (updateError) {
            console.error('❌ Error updating user:', updateError.message);
            return;
        }

        console.log('✅ Score reset successfully!');
        console.log(`📊 New score: 0`);
        console.log(`📝 New problems solved: 0`);

        // Optionally, delete their submissions (uncomment if you want to clear submission history too)
        // const { error: deleteError } = await supabase
        //     .from('submissions')
        //     .delete()
        //     .eq('user_id', user.id);
        // 
        // if (!deleteError) {
        //     console.log('✅ Submission history cleared');
        // }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Get roll number from command line argument
const rollNumber = process.argv[2];

if (!rollNumber) {
    console.log('Usage: node reset_user_score.js <roll_number>');
    console.log('Example: node reset_user_score.js 25I-0673');
    process.exit(1);
}

resetUserScore(rollNumber);

import { supabase } from './src/lib/supabase.js'

async function testQueries() {
    console.log('\n=== Testing Profile Query ===')
    const userId = '7b47d06a-0564-4953-aeb9-32035800e7fe' // Sample user from earlier
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    
    if (profileError) {
        console.error('❌ Profile error:', profileError)
    } else {
        console.log('✅ Profile loaded:', profile)
        console.log('Score:', profile.total_score)
        console.log('Streak:', profile.current_streak)
    }
    
    console.log('\n=== Testing Leaderboard Query ===')
    const { data: leaderboard, error: leaderboardError } = await supabase
        .from('profiles')
        .select('id, full_name, email, total_score, current_streak, batch, department')
        .order('total_score', { ascending: false })
        .limit(5)
    
    if (leaderboardError) {
        console.error('❌ Leaderboard error:', leaderboardError)
    } else {
        console.log('✅ Leaderboard loaded:', leaderboard.length, 'users')
        leaderboard.forEach((u, i) => {
            console.log(`${i+1}. ${u.full_name}: ${u.total_score} points, ${u.current_streak} streak`)
        })
    }
}

testQueries()

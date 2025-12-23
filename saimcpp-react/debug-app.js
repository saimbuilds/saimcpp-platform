// Quick debug - check if the issue is React Query
import { supabase } from './src/lib/supabase.js'

async function checkAuth() {
    console.log('\n=== Checking Auth ===')
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session:', session ? `User: ${session.user.email}` : 'No session')
    
    if (session) {
        console.log('\n=== Checking User Profile ===')
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
        
        if (error) {
            console.error('❌ Profile error:', error)
        } else if (profile) {
            console.log('✅ Profile found:', profile.full_name || profile.email)
            console.log('   Score:', profile.total_score)
            console.log('   Streak:', profile.current_streak)
        } else {
            console.log('⚠️  No profile found for this user!')
            console.log('   User ID:', session.user.id)
        }
    }
}

checkAuth()

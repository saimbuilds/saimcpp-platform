// TEST SCRIPT - Check Supabase Connection
import { supabase } from './src/lib/supabase.js'

console.log('🔍 Testing Supabase Connection...\n')
console.log('📍 Supabase URL:', 'https://hvizuvovmdcjixqwmcgw.supabase.co')

async function testConnection() {
    try {
        // Test 1: Get current user
        console.log('\n[Test 1] Getting current user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
            console.error('❌ User error:', userError.message)
        } else {
            console.log('✅ User:', user?.email || 'Not logged in')
        }

        // Test 2: Check profiles table
        console.log('\n[Test 2] Checking profiles table...')
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5)

        if (profilesError) {
            console.error('❌ Profiles error:', profilesError.message)
            console.error('Full error:', profilesError)
        } else {
            console.log(`✅ Found ${profiles?.length || 0} profiles`)
            if (profiles?.length > 0) {
                console.log('First profile columns:', Object.keys(profiles[0]))
                console.log('Sample profile:', profiles[0])
            }
        }

        // Test 3: Count total profiles
        console.log('\n[Test 3] Counting total users...')
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            console.error('❌ Count error:', countError.message)
        } else {
            console.log(`✅ Total users in database: ${count}`)
        }

        // Test 4: Check submissions table
        console.log('\n[Test 4] Checking submissions table...')
        const { data: submissions, error: submissionsError } = await supabase
            .from('submissions')
            .select('*')
            .limit(3)

        if (submissionsError) {
            console.error('❌ Submissions error:', submissionsError.message)
        } else {
            console.log(`✅ Found ${submissions?.length || 0} submissions`)
        }

    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testConnection()

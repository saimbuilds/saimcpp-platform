import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hvizuvovmdcjixqwmcgw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXp1dm92bWRjaml4cXdtY2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM0NDYsImV4cCI6MjA4MTQ3OTQ0Nn0.pfvvAIKg0YCddlNAvyj8tmkqBAJH_eanSYAqNgXzxBo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    })
    return { data, error }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    return { data, error }
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    return { data, error }
}

export async function createProfile(profile) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single()

    return { data, error }
}

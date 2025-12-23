import { create } from 'zustand'
import { supabase, getProfile } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),

    setProfile: (profile) => set({ profile }),

    setLoading: (loading) => set({ loading }),

    initialize: async () => {
        try {
            console.log('🔐 Initializing auth...')
            set({ loading: true })

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth session error:', error)
                set({ user: null, profile: null, loading: false, initialized: true })
                return
            }

            if (session?.user) {
                console.log('✓ User session found:', session.user.email)
                set({ user: session.user })

                try {
                    const { data: profile } = await getProfile(session.user.id)
                    set({ profile })
                } catch (profileError) {
                    console.error('Profile fetch error:', profileError)
                }
            } else {
                console.log('✗ No user session')
            }

            set({ loading: false, initialized: true })
            console.log('✓ Auth initialized')
        } catch (error) {
            console.error('Failed to initialize auth:', error)
            set({ user: null, profile: null, loading: false, initialized: true })
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
    },

    updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

        set({ profile })
        return profile
    },
}))

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState()

    if (session?.user) {
        store.setUser(session.user)
        const { data: profile } = await getProfile(session.user.id)
        store.setProfile(profile)
        store.setLoading(false)
    } else {
        store.setUser(null)
        store.setProfile(null)
    }
})

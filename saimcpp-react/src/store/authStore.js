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
        console.log('🔐 [AUTH] Starting initialization...')

        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            console.log('🔐 [AUTH] Session result:', { hasSession: !!session, error: error?.message })

            if (error) {
                console.error('🔐 [AUTH] Session error:', error)
                set({ user: null, profile: null, loading: false, initialized: true })
                return
            }

            if (session?.user) {
                console.log('🔐 [AUTH] User found:', session.user.email)
                set({ user: session.user, initialized: true })

                // Fetch profile and wait for it to complete before setting loading to false
                try {
                    const { data: profile, error: profileError } = await getProfile(session.user.id)

                    if (profileError) {
                        console.error('🔐 [AUTH] Profile error:', profileError)
                        set({ profile: null, loading: false })
                    } else {
                        console.log('🔐 [AUTH] Profile loaded:', profile)
                        set({ profile, loading: false })
                    }
                } catch (err) {
                    console.error('🔐 [AUTH] Profile fetch failed:', err)
                    set({ profile: null, loading: false })
                }
            } else {
                console.log('🔐 [AUTH] No session, user logged out')
                set({ user: null, profile: null, loading: false, initialized: true })
            }
        } catch (error) {
            console.error('🔐 [AUTH] Initialize failed:', error)
            set({ user: null, profile: null, loading: false, initialized: true })
        }

        console.log('🔐 [AUTH] Initialization complete')
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
    console.log('🔐 [AUTH] State change:', event, session?.user?.email)
    const store = useAuthStore.getState()

    // Only handle sign out events to clear state
    // Don't fetch profile here to avoid race conditions with initialize()
    if (event === 'SIGNED_OUT') {
        console.log('🔐 [AUTH] User signed out, clearing state')
        store.setUser(null)
        store.setProfile(null)
        store.setLoading(false)
    } else if (event === 'SIGNED_IN' && session?.user) {
        // Only if we're not already initialized, update user and load profile
        console.log('🔐 [AUTH] User signed in, loading profile')
        store.setUser(session.user)
        store.setLoading(false)

        // Fetch profile in background
        getProfile(session.user.id)
            .then(({ data: profile }) => {
                console.log('🔐 [AUTH] Profile loaded from sign-in event:', profile)
                store.setProfile(profile)
            })
            .catch(err => console.error('🔐 [AUTH] Profile error on sign-in:', err))
    }
    // For TOKEN_REFRESHED and other events, do nothing - let initialize() handle it
})

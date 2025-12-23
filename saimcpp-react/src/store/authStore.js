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
                set({ user: session.user, loading: false, initialized: true })

                // Fetch profile without blocking
                getProfile(session.user.id)
                    .then(({ data: profile }) => {
                        console.log('🔐 [AUTH] Profile loaded:', profile)
                        set({ profile })
                    })
                    .catch(err => console.error('🔐 [AUTH] Profile error:', err))
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

    if (session?.user) {
        store.setUser(session.user)
        store.setLoading(false)
        const { data: profile } = await getProfile(session.user.id)
        store.setProfile(profile)
    } else {
        store.setUser(null)
        store.setProfile(null)
    }
})

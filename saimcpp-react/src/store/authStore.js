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
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                set({ user: session.user })
                const { data: profile } = await getProfile(session.user.id)
                set({ profile })
            }

            set({ loading: false, initialized: true })
        } catch (error) {
            console.error('Failed to initialize auth:', error)
            set({ loading: false, initialized: true })
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
    } else {
        store.setUser(null)
        store.setProfile(null)
    }
})

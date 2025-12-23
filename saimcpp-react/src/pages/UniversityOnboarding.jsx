import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { motion } from 'framer-motion'

export default function UniversityOnboarding() {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const [universities, setUniversities] = useState([])
    const [selectedUniversity, setSelectedUniversity] = useState('')
    const [batch, setBatch] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadUniversities()
        // Pre-fill username from email
        if (user?.email) {
            const emailUsername = user.email.split('@')[0].toLowerCase()
            setUsername(emailUsername)
        }
    }, [user])

    const loadUniversities = async () => {
        const { data } = await supabase
            .from('universities')
            .select('*')
            .order('name')
        setUniversities(data || [])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedUniversity || !batch || !username) {
            alert('Please fill all fields')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    university_id: selectedUniversity,
                    batch,
                    username: username.toLowerCase()
                })
                .eq('id', user.id)

            if (error) throw error

            // Refresh profile and navigate
            navigate('/problems')
        } catch (error) {
            console.error('Onboarding error:', error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8">
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-3xl font-bold">Welcome to SaimCPP! 🎉</h1>
                        <p className="text-muted-foreground">
                            Let's set up your profile
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                placeholder="username"
                                className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-accent-blue focus:outline-none"
                                required
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Your public profile will be at /u/{username || 'username'}
                            </p>
                        </div>

                        {/* University */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                University
                            </label>
                            <select
                                value={selectedUniversity}
                                onChange={(e) => setSelectedUniversity(e.target.value)}
                                className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-accent-blue focus:outline-none"
                                required
                            >
                                <option value="">Select your university</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>
                                        {uni.short_name} - {uni.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Batch */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Batch (Graduation Year)
                            </label>
                            <select
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                                className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-accent-blue focus:outline-none"
                                required
                            >
                                <option value="">Select graduation year</option>
                                {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Setting up...' : 'Continue'}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}

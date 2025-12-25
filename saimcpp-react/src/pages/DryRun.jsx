import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { loadDryRunProblems } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Code2, Heart } from 'lucide-react'

const TRACK_NAMES = {
    pf: 'Programming Fundamentals',
    'pf-lab': 'PF Lab Practice',
    op: 'Object-Oriented Programming',
    dsa: 'Data Structures & Algorithms'
}

export default function DryRun() {
    const navigate = useNavigate()
    const { track = 'pf' } = useParams()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const trackName = TRACK_NAMES[track] || 'Unknown Track'

    const [filters, setFilters] = useState({
        difficulty: 'all',
        status: 'all',
        favoritesOnly: false,
    })

    // Load dry run problems
    const { data: dryRuns = [], isLoading } = useQuery({
        queryKey: ['dry-runs'],
        queryFn: loadDryRunProblems,
    })

    // Load solved dry runs
    const { data: solvedDryRuns = [] } = useQuery({
        queryKey: ['solved-dry-runs', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data } = await supabase
                .from('submissions')
                .select('problem_id')
                .eq('user_id', user.id)
                .eq('status', 'accepted')
                .in('problem_id', dryRuns.map((d) => d.id))
            return data?.map((s) => s.problem_id) || []
        },
        enabled: !!user && dryRuns.length > 0,
    })

    // Load favorites
    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites-dryruns', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data } = await supabase
                .from('favorites')
                .select('problem_id')
                .eq('user_id', user.id)
            return data?.map((f) => f.problem_id) || []
        },
        enabled: !!user,
        retry: false,
    })

    // Toggle favorite
    const toggleFavorite = async (dryRunId) => {
        if (!user) {
            alert('Please login to favorite dry runs')
            return
        }

        try {
            const isFavorite = favorites.includes(dryRunId)

            if (isFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('problem_id', dryRunId)

                if (error) {
                    console.error('Error removing favorite:', error)
                    alert('Failed to remove favorite: ' + error.message)
                    return
                }
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, problem_id: dryRunId }])

                if (error) {
                    console.error('Error adding favorite:', error)
                    alert('Failed to add favorite: ' + error.message)
                    return
                }
            }

            // Refresh favorites data
            queryClient.invalidateQueries(['favorites-dryruns', user?.id])
        } catch (error) {
            console.error('Unexpected error:', error)
            alert('Something went wrong: ' + error.message)
        }
    }

    // Filter dry runs
    const filteredDryRuns = dryRuns.filter((dryRun) => {
        if (filters.difficulty !== 'all' && dryRun.difficulty !== filters.difficulty) return false
        if (filters.status === 'solved' && !solvedDryRuns.includes(dryRun.id)) return false
        if (filters.status === 'unsolved' && solvedDryRuns.includes(dryRun.id)) return false
        if (filters.favoritesOnly && !favorites.includes(dryRun.id)) return false
        return true
    })

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading dry runs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-8 py-8">
                {/* Track Header with Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 text-sm font-bold text-white">
                            {track.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{trackName}</h1>
                            <p className="text-sm text-muted-foreground">Dry Run Challenges</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/learning/${track}/problems`)}
                        className="flex items-center gap-2"
                    >
                        <Code2 className="h-4 w-4" />
                        Switch to Problems
                    </Button>
                </div>

                {/* Compact Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
                    {/* Difficulty Buttons */}
                    <div className="flex gap-2">
                        {['all', 'easy', 'medium', 'hard'].map((diff) => (
                            <Button
                                key={diff}
                                variant={filters.difficulty === diff ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilters({ ...filters, difficulty: diff })}
                                className="capitalize"
                            >
                                {diff === 'all' ? 'All' : diff}
                            </Button>
                        ))}
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                        {['all', 'unsolved', 'solved'].map((status) => (
                            <Button
                                key={status}
                                variant={filters.status === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilters({ ...filters, status })}
                                className="capitalize"
                            >
                                {status === 'all' ? 'All' : status}
                            </Button>
                        ))}
                    </div>

                    {/* Favorites Toggle */}
                    <Button
                        variant={filters.favoritesOnly ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
                        className="flex items-center gap-2"
                    >
                        <Heart className={`h-4 w-4 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
                        Favorites
                    </Button>
                </div>

                {/* Dry Runs Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDryRuns.map((dryRun, index) => (
                        <motion.div
                            key={dryRun.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.03, 1) }}
                            whileHover={{ y: -4 }}
                        >
                            <Card
                                className={`cursor-pointer p-6 transition-all hover:border-accent-blue hover:shadow-lg ${solvedDryRuns.includes(dryRun.id)
                                    ? 'border-l-4 border-l-easy bg-gradient-to-r from-easy/5 to-transparent'
                                    : ''
                                    }`}
                                onClick={() => navigate(`/dry-run/${dryRun.id}`)}
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-xl font-semibold">{dryRun.title}</h3>
                                        <Badge variant={dryRun.difficulty} className="mt-2">
                                            {dryRun.difficulty}
                                        </Badge>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleFavorite(dryRun.id)
                                        }}
                                        className="transition-all hover:scale-110"
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${favorites.includes(dryRun.id)
                                                ? 'fill-red-500 text-red-500'
                                                : 'text-muted-foreground hover:text-red-500'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-base text-muted-foreground">
                                    <span>📝 Dry Run</span>
                                    <span>🎯 {dryRun.points || 5} points</span>
                                </div>

                                {solvedDryRuns.includes(dryRun.id) && (
                                    <div className="mt-3 text-base font-medium text-easy">✓ Solved</div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredDryRuns.length === 0 && (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4 text-6xl">🔍</div>
                            <p className="text-xl text-muted-foreground">No dry runs found</p>
                            <p className="mt-2 text-sm text-muted">
                                Try adjusting your filters
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

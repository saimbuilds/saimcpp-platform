import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { loadAllProblems } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Star, Code2, FolderOpen, Target, CheckCircle2, Zap } from 'lucide-react'

const TRACK_NAMES = {
    pf: 'Programming Fundamentals',
    'pf-lab': 'PF Lab Practice',
    op: 'Object-Oriented Programming',
    dsa: 'Data Structures & Algorithms'
}

export default function Problems() {
    const navigate = useNavigate()
    const { track = 'pf' } = useParams()
    const { user } = useAuthStore()

    const trackName = TRACK_NAMES[track] || 'Unknown Track'

    const [filters, setFilters] = useState({
        category: 'all',
        difficulty: 'all',
        status: 'all',
        favoritesOnly: false,
    })

    // Load problems
    const { data: problems = [], isLoading, error } = useQuery({
        queryKey: ['problems'],
        queryFn: loadAllProblems,
        retry: false,
        staleTime: Infinity,
    })

    // Load solved problems
    const { data: solvedProblems = [] } = useQuery({
        queryKey: ['solved-problems', user?.id],
        queryFn: async () => {
            if (!user) return []
            const { data } = await supabase
                .from('submissions')
                .select('problem_id')
                .eq('user_id', user.id)
                .eq('status', 'accepted')
            return data?.map((s) => s.problem_id) || []
        },
        enabled: !!user,
        retry: false,
    })

    // Load favorites
    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites', user?.id],
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
    const toggleFavorite = async (problemId) => {
        if (!user) return

        const isFavorite = favorites.includes(problemId)

        if (isFavorite) {
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('problem_id', problemId)
        } else {
            await supabase
                .from('favorites')
                .insert([{ user_id: user.id, problem_id: problemId }])
        }
    }

    // Filter problems
    const filteredProblems = problems.filter((problem) => {
        if (filters.category !== 'all' && problem.category !== filters.category) return false
        if (filters.difficulty !== 'all' && problem.difficulty !== filters.difficulty) return false
        if (filters.status === 'solved' && !solvedProblems.includes(problem.id)) return false
        if (filters.status === 'unsolved' && solvedProblems.includes(problem.id)) return false
        if (filters.favoritesOnly && !favorites.includes(problem.id)) return false
        return true
    })

    // Show error if query failed
    if (error) {
        console.error('Failed to load problems:', error)
    }

    // Only show loading on initial load (no data yet)
    // Don't block on refetch
    if (isLoading && problems.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading problems...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl px-8 py-8">
            {/* Track Header with Navigation */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 text-sm font-bold text-white">
                        {track.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{trackName}</h1>
                        <p className="text-sm text-muted-foreground">Practice Problems</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/learning/${track}/dry-runs`)}
                    className="flex items-center gap-2"
                >
                    <Zap className="h-4 w-4" />
                    Switch to Dry Runs
                </Button>
            </div>

            {/* Compact Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
                {/* Category Dropdown */}
                <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-48"
                >
                    <option value="all">All Categories</option>
                    <option value="Arrays">Arrays</option>
                    <option value="Functions">Functions</option>
                    <option value="Pointers">Pointers</option>
                    <option value="Bitwise">Bitwise Operations</option>
                    <option value="DynamicMemory">Dynamic Memory</option>
                    <option value="Recursion">Recursion</option>
                </Select>

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

                {/* Favorites Checkbox */}
                <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={filters.favoritesOnly}
                        onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                    />
                    ⭐ Favorites
                </label>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProblems.map((problem, index) => (
                    <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card
                            className={`cursor-pointer p-6 transition-all hover:border-accent-blue hover:shadow-lg ${solvedProblems.includes(problem.id)
                                ? 'border-l-4 border-l-easy bg-gradient-to-r from-easy/5 to-transparent'
                                : ''
                                }`}
                            onClick={() => navigate(`/problem/${problem.id}`)}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="mb-1 text-lg font-semibold">{problem.title}</h3>
                                    <Badge variant={problem.difficulty} className="mt-2">
                                        {problem.difficulty}
                                    </Badge>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFavorite(problem.id)
                                    }}
                                    className={`text-2xl transition-transform hover:scale-125 ${favorites.includes(problem.id) ? '' : 'grayscale'
                                        }`}
                                >
                                    ⭐
                                </button>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <FolderOpen className="h-4 w-4" />
                                    <span>{problem.category}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Target className="h-4 w-4" />
                                    <span>{problem.points || 10} points</span>
                                </div>
                            </div>

                            {solvedProblems.includes(problem.id) && (
                                <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-easy">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Solved
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredProblems.length === 0 && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">🔍</div>
                        <p className="text-xl text-muted-foreground">No problems found</p>
                        <p className="mt-2 text-sm text-muted">
                            Try adjusting your filters
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

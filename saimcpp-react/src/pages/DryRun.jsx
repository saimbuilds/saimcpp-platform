import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { loadDryRunProblems } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export default function DryRun() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [filters, setFilters] = useState({
        difficulty: 'all',
        status: 'all',
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

    // Filter dry runs
    const filteredDryRuns = dryRuns.filter((dryRun) => {
        if (filters.difficulty !== 'all' && dryRun.difficulty !== filters.difficulty) return false
        if (filters.status === 'solved' && !solvedDryRuns.includes(dryRun.id)) return false
        if (filters.status === 'unsolved' && solvedDryRuns.includes(dryRun.id)) return false
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
        <div className="container mx-auto px-6 py-8">
            {/* Filters */}
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-lg">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">Difficulty</label>
                        <div className="flex gap-2">
                            {['all', 'easy', 'medium', 'hard'].map((diff) => (
                                <Button
                                    key={diff}
                                    variant={filters.difficulty === diff ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilters({ ...filters, difficulty: diff })}
                                    className="flex-1 capitalize"
                                >
                                    {diff === 'all' ? 'All' : diff}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">Status</label>
                        <div className="flex gap-2">
                            {['all', 'unsolved', 'solved'].map((status) => (
                                <Button
                                    key={status}
                                    variant={filters.status === status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilters({ ...filters, status })}
                                    className="flex-1 capitalize"
                                >
                                    {status === 'all' ? 'All' : status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dry Runs Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDryRuns.map((dryRun, index) => (
                    <motion.div
                        key={dryRun.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card
                            className={`cursor-pointer p-6 transition-all hover:border-accent-blue hover:shadow-lg ${solvedDryRuns.includes(dryRun.id)
                                ? 'border-l-4 border-l-easy bg-gradient-to-r from-easy/5 to-transparent'
                                : ''
                                }`}
                            onClick={() => navigate(`/dry-run/${dryRun.id}`)}
                        >
                            <div className="mb-4">
                                <h3 className="mb-2 text-lg font-semibold">{dryRun.title}</h3>
                                <Badge variant={dryRun.difficulty} className="mt-2">
                                    {dryRun.difficulty}
                                </Badge>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>📝 Dry Run</span>
                                <span>🎯 {dryRun.points || 5} points</span>
                            </div>

                            {solvedDryRuns.includes(dryRun.id) && (
                                <div className="mt-3 text-sm font-medium text-easy">✓ Solved</div>
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
    )
}

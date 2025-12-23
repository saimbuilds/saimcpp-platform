import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

export default function Leaderboard() {
    const { user } = useAuthStore()

    // Load leaderboard data
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, total_score, current_streak, batch, department')
                .order('total_score', { ascending: false })
                .limit(20)

            if (error) throw error

            // Count solved problems for each user
            const usersWithStats = await Promise.all(
                data.map(async (profile) => {
                    const { data: submissions } = await supabase
                        .from('submissions')
                        .select('problem_id')
                        .eq('user_id', profile.id)
                        .eq('status', 'accepted')

                    const uniqueProblems = new Set(submissions?.map((s) => s.problem_id) || [])

                    return {
                        ...profile,
                        solved: uniqueProblems.size,
                        current_streak: profile.current_streak || 0,
                    }
                })
            )

            return usersWithStats
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })

    const getMedalIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
        if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />
        return null
    }

    const getMedalColor = (rank) => {
        if (rank === 1) return 'text-yellow-400'
        if (rank === 2) return 'text-gray-400'
        if (rank === 3) return 'text-orange-600'
        return 'text-foreground'
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="mb-2 text-4xl font-bold">Leaderboard</h2>
                <p className="text-muted-foreground">Top performers this week</p>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="mb-12 flex items-end justify-center gap-8">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-48"
                    >
                        <Card className="border-2 border-gray-400/30 bg-gradient-to-br from-gray-400/10 to-transparent p-6 text-center">
                            <Medal className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                            <div className="mb-2 text-4xl font-bold text-gray-400">2</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[1].full_name || leaderboard[1].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-2xl font-bold text-accent-blue">
                                {leaderboard[1].score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {leaderboard[1].solved} solved
                            </p>
                        </Card>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-48"
                    >
                        <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent p-6 text-center">
                            <Trophy className="mx-auto mb-3 h-16 w-16 text-yellow-400" />
                            <div className="mb-2 text-5xl font-bold text-yellow-400">1</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[0].full_name || leaderboard[0].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-3xl font-bold text-accent-blue">
                                {leaderboard[0].score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {leaderboard[0].solved} solved
                            </p>
                        </Card>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-48"
                    >
                        <Card className="border-2 border-orange-600/30 bg-gradient-to-br from-orange-600/10 to-transparent p-6 text-center">
                            <Award className="mx-auto mb-3 h-12 w-12 text-orange-600" />
                            <div className="mb-2 text-4xl font-bold text-orange-600">3</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[2].full_name || leaderboard[2].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-2xl font-bold text-accent-blue">
                                {leaderboard[2].score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {leaderboard[2].solved} solved
                            </p>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Full Leaderboard Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border bg-secondary">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    User
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">
                                    Score
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">
                                    Solved
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">
                                    Streak
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    Batch
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((profile, index) => {
                                const rank = index + 1
                                const isCurrentUser = profile.id === user?.id

                                return (
                                    <motion.tr
                                        key={profile.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`border-b border-border transition-colors hover:bg-muted ${isCurrentUser ? 'bg-accent-blue/10' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getMedalIcon(rank)}
                                                <span className={`text-lg font-bold ${getMedalColor(rank)}`}>
                                                    {rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {profile.full_name || profile.email?.split('@')[0]}
                                                    {isCurrentUser && (
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            You
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {profile.department || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-accent-blue">
                                                {profile.total_score || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-foreground">{profile.solved}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-accent-green">{profile.current_streak}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {profile.batch || 'N/A'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {leaderboard.length === 0 && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">🏆</div>
                        <p className="text-xl text-muted-foreground">No data yet</p>
                        <p className="mt-2 text-sm text-muted">
                            Start solving problems to appear on the leaderboard!
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Target, Trophy, Flame, Calendar } from 'lucide-react'

export default function Profile() {
    const { user, profile } = useAuthStore()

    // Load user stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['user-stats', user?.id],
        queryFn: async () => {
            if (!user) return null

            // Get submissions
            const { data: submissions } = await supabase
                .from('submissions')
                .select('problem_id, status, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Count unique solved problems
            const solvedProblems = new Set(
                submissions
                    ?.filter((s) => s.status === 'accepted')
                    .map((s) => s.problem_id) || []
            )

            // Get global rank
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('id, total_score')
                .order('total_score', { ascending: false })

            const rank =
                allProfiles?.findIndex((p) => p.id === user.id) + 1 || 0
            const totalUsers = allProfiles?.length || 0

            return {
                solved: solvedProblems.size,
                submissions: submissions?.length || 0,
                rank,
                totalUsers,
                total_score: profile?.total_score || 0,
                current_streak: profile?.current_streak || 0,
            }
        },
        enabled: !!user,
    })

    // Load recent submissions
    const { data: recentSubmissions = [] } = useQuery({
        queryKey: ['recent-submissions', user?.id],
        queryFn: async () => {
            if (!user) return []

            const { data } = await supabase
                .from('submissions')
                .select('problem_id, status, created_at, points_earned')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            return data || []
        },
        enabled: !!user,
    })

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Card className="p-8">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-green text-4xl">
                            👤
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h2 className="mb-1 text-3xl font-bold">
                                {profile?.full_name || user?.email?.split('@')[0]}
                            </h2>
                            <p className="text-muted-foreground">
                                {profile?.email || user?.email}
                            </p>
                            {profile?.batch && profile?.department && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {profile.department} · {profile.batch}
                                </p>
                            )}
                        </div>

                        {/* Rank Badge */}
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Global Rank</p>
                            <p className="text-3xl font-bold text-accent-blue">
                                #{stats?.rank || '--'}
                            </p>
                            <p className="text-xs text-muted">
                                of {stats?.totalUsers || '--'} users
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-easy/10">
                                <Target className="h-6 w-6 text-easy" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-blue">
                                {stats?.solved || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Problems Solved</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10">
                                <Trophy className="h-6 w-6 text-accent-blue" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-blue">
                                {stats?.total_score || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/10">
                                <Flame className="h-6 w-6 text-accent-green" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-green">
                                {stats?.current_streak || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Day Streak</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-yellow/10">
                                <Calendar className="h-6 w-6 text-accent-yellow" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-yellow">
                                {stats?.submissions || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Total Submissions</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Submissions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSubmissions.length > 0 ? (
                            <div className="space-y-3">
                                {recentSubmissions.map((submission, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    submission.status === 'accepted'
                                                        ? 'easy'
                                                        : 'destructive'
                                                }
                                            >
                                                {submission.status === 'accepted' ? '✓' : '✗'}
                                            </Badge>
                                            <div>
                                                <p className="font-medium">
                                                    Problem #{submission.problem_id}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(submission.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {submission.status === 'accepted' && (
                                            <span className="text-sm font-medium text-accent-blue">
                                                +{submission.points_earned} pts
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">No submissions yet</p>
                                <p className="mt-1 text-sm text-muted">
                                    Start solving problems to see your activity here!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

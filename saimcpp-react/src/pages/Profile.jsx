import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Target, Trophy, Flame, Calendar, Linkedin, Github, Twitter, Globe } from 'lucide-react'

export default function Profile() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()

    // Get user stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['user-stats', user?.id],
        queryFn: async () => {
            if (!user) return null

            // Get all submissions for this user
            const { data: submissions, error: submissionsError } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', user.id)

            if (submissionsError) throw submissionsError

            // Count solved problems (unique problem_ids with accepted status)
            const solvedProblems = new Set(
                submissions?.filter((s) => s.status === 'accepted').map((s) => s.problem_id) ||
                []
            )

            // Get all profiles to calculate rank
            const { data: allProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, total_score')
                .order('total_score', { ascending: false })

            if (profilesError) throw profilesError

            // Find user's rank
            const rank = allProfiles.findIndex((p) => p.id === user.id) + 1
            const totalUsers = allProfiles.length

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
        <div className="container mx-auto max-w-6xl px-8 py-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Card className="p-8">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile?.full_name}
                                className="h-20 w-20 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                }}
                            />
                        ) : null}
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-4xl font-bold text-white"
                            style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
                        >
                            {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '👤'}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h2 className="mb-1 text-3xl font-bold">
                                {profile?.full_name || user?.email?.split('@')[0]}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                @{profile?.username}
                            </p>
                            <div className="mt-2 flex gap-4 text-sm">
                                <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() => navigate(`/u/${profile?.username}/followers`)}
                                >
                                    <strong>{profile?.follower_count || 0}</strong> followers
                                </span>
                                <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() => navigate(`/u/${profile?.username}/following`)}
                                >
                                    <strong>{profile?.following_count || 0}</strong> following
                                </span>
                            </div>

                            {/* Social Media Links */}
                            {(profile?.linkedin_url || profile?.github_url || profile?.twitter_url || profile?.portfolio_url) && (
                                <div className="mt-3 flex gap-2">
                                    {profile?.linkedin_url && (
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Linkedin className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile?.github_url && (
                                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Github className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile?.twitter_url && (
                                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Twitter className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile?.portfolio_url && (
                                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Globe className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/edit-profile', { replace: true })}
                                className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600"
                            >
                                Edit Profile
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate(`/u/${profile?.username}`)}
                                className="whitespace-nowrap text-xs"
                            >
                                View Public Profile
                            </Button>
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

            {/* Recent Activity */}
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
                        <p className="py-12 text-center text-muted-foreground">
                            Recent submissions will appear here...
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

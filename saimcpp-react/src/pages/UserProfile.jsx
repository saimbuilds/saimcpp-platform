import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Trophy, Target, Flame, Calendar, Linkedin, Github, Twitter, Globe, Users, UserPlus, UserMinus } from 'lucide-react'

import { CreatorBadge, isCreator } from '../components/ui/creator-badge'
export default function UserProfile() {
    const navigate = useNavigate()
    const { username } = useParams()
    const { user: currentUser } = useAuthStore()
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    // Load user profile
    const { data: profile, isLoading, refetch } = useQuery({
        queryKey: ['user-profile', username],
        queryFn: async () => {
            // Get user by username
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    university:universities(short_name, name)
                `)
                .eq('username', username)
                .maybeSingle()

            if (error) throw error
            if (!profileData) return null

            // Get submissions count
            const { data: submissions } = await supabase
                .from('submissions')
                .select('problem_id, status')
                .eq('user_id', profileData.id)

            const solvedProblems = new Set(
                submissions?.filter(s => s.status === 'accepted').map(s => s.problem_id) || []
            )

            return {
                ...profileData,
                solved: solvedProblems.size,
                submissions: submissions?.length || 0
            }
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes to prevent loading on page reload
        enabled: !!username
    })

    // Check if current user follows this profile
    useEffect(() => {
        if (currentUser && profile) {
            checkFollowStatus()
        }
    }, [currentUser, profile])

    const checkFollowStatus = async () => {
        if (!currentUser || !profile) return

        const { data } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', profile.id)
            .maybeSingle()

        setIsFollowing(!!data)
    }

    const handleFollow = async () => {
        if (!currentUser || !profile) return

        setFollowLoading(true)
        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from('followers')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id)
                setIsFollowing(false)
            } else {
                // Follow
                await supabase
                    .from('followers')
                    .insert({
                        follower_id: currentUser.id,
                        following_id: profile.id
                    })
                setIsFollowing(true)
            }
            refetch()
        } catch (error) {
            console.error('Follow error:', error)
        } finally {
            setFollowLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-6xl">😕</div>
                    <h2 className="mb-2 text-2xl font-bold">User not found</h2>
                    <p className="text-muted-foreground">@{username} doesn't exist</p>
                </div>
            </div>
        )
    }

    const isOwnProfile = currentUser?.id === profile.id

    // Check if this profile is the founder (from database role)
    const isFounder = profile?.role === 'founder'

    return (
        <div className="container mx-auto max-w-6xl px-8 py-8">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Card className="p-8">
                    <div className="flex items-start justify-between gap-8">
                        <div className="flex gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile?.avatar_url}
                                        alt={profile?.full_name || profile.username}
                                        className="h-24 w-24 rounded-full object-cover"
                                        style={isFounder ? {
                                            border: '3px solid rgb(168, 85, 247)',
                                            boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 35px rgba(168, 85, 247, 0.5)',
                                            animation: 'gentleGlow 3s ease-in-out infinite'
                                        } : {}}
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-5xl font-bold text-white"
                                    style={isFounder ? {
                                        border: '3px solid rgb(168, 85, 247)',
                                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 35px rgba(168, 85, 247, 0.5)',
                                        animation: 'gentleGlow 3s ease-in-out infinite',
                                        display: profile?.avatar_url ? 'none' : 'flex'
                                    } : { display: profile?.avatar_url ? 'none' : 'flex' }}
                                >
                                    {profile?.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '👤'}
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1
                                        className={`mb-1 text-3xl font-bold ${isFounder
                                            ? 'text-purple-600'
                                            : ''
                                            }`}
                                        style={isFounder ? {
                                            textShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 35px rgba(147, 51, 234, 0.3)',
                                            animation: 'gentleGlow 3s ease-in-out infinite'
                                        } : {}}
                                    >
                                        {profile?.full_name || profile.email?.split('@')[0]}
                                    </h1>
                                    {isFounder && (
                                        <div
                                            className="rounded-md bg-purple-500 px-2.5 py-1 text-xs font-semibold text-white border border-purple-400"
                                            style={{
                                                boxShadow: '0 0 15px rgba(168, 85, 247, 0.6), 0 0 25px rgba(168, 85, 247, 0.4)',
                                                animation: 'gentleGlow 3s ease-in-out infinite'
                                            }}
                                        >
                                            FOUNDER
                                        </div>
                                    )}
                                </div>

                                {/* CSS Keyframes for gentle glow animation */}
                                <style>{`
                                    @keyframes gentleGlow {
                                        0%, 100% {
                                            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
                                        }
                                        50% {
                                            filter: drop-shadow(0 0 12px rgba(147, 51, 234, 0.6));
                                        }
                                    }
                                `}</style>

                                {profile.bio && (
                                    <p className="mb-3 max-w-2xl text-foreground">{profile.bio}</p>
                                )}

                                {/* Social Links */}
                                <div className="flex gap-2">
                                    {profile.linkedin_url && (
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="hover:bg-[#0A66C2] hover:text-white transition-colors">
                                                <Linkedin className="h-4 w-4" fill="currentColor" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile.github_url && (
                                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm">
                                                <Github className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile.twitter_url && (
                                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm">
                                                <Twitter className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {profile.portfolio_url && (
                                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm">
                                                <Globe className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Follow/Edit Button */}
                        <div>
                            {isOwnProfile ? (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    variant={isFollowing ? "outline" : "default"}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Follow
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Follower Stats */}
                    <div className="mt-6 flex gap-6 border-t border-border pt-4">
                        <div
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate(`/u/${profile.username}/followers`)}
                        >
                            <span className="font-bold">{profile.follower_count || 0}</span>
                            <span className="ml-1 text-muted-foreground">followers</span>
                        </div>
                        <div
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate(`/u/${profile.username}/following`)}
                        >
                            <span className="font-bold">{profile.following_count || 0}</span>
                            <span className="ml-1 text-muted-foreground">following</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-easy/10">
                                <Target className="h-6 w-6 text-easy" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-blue">
                                {profile.solved || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Problems Solved</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10">
                                <Trophy className="h-6 w-6 text-accent-blue" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-blue">
                                {profile.total_score || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/10">
                                <Flame className="h-6 w-6 text-accent-green" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-green">
                                {profile.current_streak || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Day Streak</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-yellow/10">
                                <Calendar className="h-6 w-6 text-accent-yellow" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-accent-yellow">
                                {profile.submissions || 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Total Submissions</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="py-12 text-center text-muted-foreground">
                            Activity feed coming soon...
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div >
    )
}

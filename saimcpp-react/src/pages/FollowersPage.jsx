import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Users, UserPlus } from 'lucide-react'

export default function FollowersPage() {
    const { username, type } = useParams() // type = 'followers' or 'following'
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    // Load user by username
    const { data: targetUser } = useQuery({
        queryKey: ['user-by-username', username],
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('username', username)
                .single()
            return data
        }
    })

    // Load followers or following
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['followers', username, type],
        queryFn: async () => {
            if (!targetUser) return []

            let query
            if (type === 'followers') {
                // People who follow this user
                query = supabase
                    .from('followers')
                    .select(`
                        follower:profiles!follower_id(
                            id,
                            username,
                            full_name,
                            avatar_url,
                            total_score,
                            follower_count,
                            university:universities(short_name)
                        )
                    `)
                    .eq('following_id', targetUser.id)
            } else {
                // People this user follows
                query = supabase
                    .from('followers')
                    .select(`
                        following:profiles!following_id(
                            id,
                            username,
                            full_name,
                            avatar_url,
                            total_score,
                            follower_count,
                            university:universities(short_name)
                        )
                    `)
                    .eq('follower_id', targetUser.id)
            }

            const { data, error } = await query
            if (error) throw error

            // Extract the nested profile data
            return data.map(item => type === 'followers' ? item.follower : item.following)
        },
        enabled: !!targetUser
    })

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto max-w-4xl px-8 py-8">
            <div className="mb-6">
                <h1 className="mb-2 text-3xl font-bold">
                    {type === 'followers' ? 'Followers' : 'Following'}
                </h1>
                <p className="text-muted-foreground">
                    {targetUser?.full_name || targetUser?.username}'s {type}
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
            </div>

            {/* Users List */}
            {isLoading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-4xl">⚡</div>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">👥</div>
                        <p className="text-xl text-muted-foreground">
                            No {type} {searchQuery ? 'found' : 'yet'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="cursor-pointer p-4 transition-all hover:border-purple-500 hover:shadow-lg"
                                onClick={() => navigate(`/u/${user.username}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.full_name || user.username}
                                                className="h-12 w-12 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                    e.target.nextSibling.style.display = 'flex'
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-xl font-bold text-white"
                                            style={{ display: user.avatar_url ? 'none' : 'flex' }}
                                        >
                                            {user.full_name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '👤'}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">
                                                {user.full_name || user.username}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>@{user.username}</span>
                                                {user.university && (
                                                    <>
                                                        <span>•</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {user.university.short_name}
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-accent-blue">
                                            {user.total_score || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            {user.follower_count || 0}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

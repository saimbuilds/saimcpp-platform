import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Trophy, Medal, Award, Search, Users } from 'lucide-react'
import { CreatorBadge, isCreator, CreatorGlow } from '../components/ui/creator-badge'
import FounderButton from '../components/ui/founder-button'

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default function Leaderboard() {
    const { user, initialized } = useAuthStore()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUniversity, setSelectedUniversity] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('problems') // 'problems' or 'exams'
    const [universities, setUniversities] = useState([])
    const [showAllUniversities, setShowAllUniversities] = useState(false)

    // Debounce search by 500ms
    const debouncedSearch = useDebounce(searchQuery, 500)

    useEffect(() => {
        loadUniversities()
    }, [])

    const loadUniversities = async () => {
        const { data } = await supabase
            .from('universities')
            .select('*')
            .order('name')
        setUniversities(data || [])
    }

    // Load leaderboard data
    const { data: leaderboard = [], isLoading, error } = useQuery({
        queryKey: ['leaderboard', selectedCategory, selectedUniversity, debouncedSearch],
        queryFn: async () => {
            if (selectedCategory === 'exams') {
                // Mock Exam Leaderboard
                let query = supabase
                    .from('profiles')
                    .select('id, full_name, email, exam_score, exam_attempts, best_exam_score, batch, department, avatar_url, username, university_id, university:universities(short_name)')
                    .gt('exam_attempts', 0) // Only show users who have submitted at least 1 exam
                    .order('exam_score', { ascending: false })
                    .order('exam_attempts', { ascending: false }) // Secondary sort by attempts
                    .neq('email', 'saimkhanwah@gmail.com') // Hide founder from leaderboard
                    .limit(20)

                if (selectedUniversity !== 'all') {
                    query = query.eq('university_id', selectedUniversity)
                }

                if (debouncedSearch.trim()) {
                    query = query.or(`full_name.ilike.%${debouncedSearch}%,username.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
                }

                const { data, error } = await query
                if (error) throw error

                return data.map(profile => ({
                    ...profile,
                    total_score: profile.exam_score || 0,
                    solved: profile.exam_attempts || 0, // Display attempts in solved column
                    current_streak: profile.best_exam_score || 0 // Display best score in streak column
                }))
            } else {
                // Regular Problem Leaderboard
                let query = supabase
                    .from('profiles')
                    .select('id, full_name, email, total_score, current_streak, batch, department, avatar_url, username, university_id, university:universities(short_name)')
                    .order('total_score', { ascending: false })
                    .neq('email', 'saimkhanwah@gmail.com') // Hide founder from leaderboard
                    .limit(20)

                if (selectedUniversity !== 'all') {
                    query = query.eq('university_id', selectedUniversity)
                }

                if (debouncedSearch.trim()) {
                    query = query.or(`full_name.ilike.%${debouncedSearch}%,username.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
                }

                const { data, error } = await query
                if (error) throw error

                // Fetch solved problems count - OPTIMIZED (was N+1 query)
                // Get all user IDs for batch query
                const userIds = data.map(p => p.id);

                // Single query for all users' submissions
                const { data: submissions } = await supabase
                    .from('submissions')
                    .select('user_id, problem_id')
                    .in('user_id', userIds)
                    .eq('status', 'accepted');

                // Build map of user_id -> Set of unique problem_ids
                const solvedMap = (submissions || []).reduce((acc, sub) => {
                    if (!acc[sub.user_id]) acc[sub.user_id] = new Set();
                    acc[sub.user_id].add(sub.problem_id);
                    return acc;
                }, {});

                // Map solved counts to profiles
                const profilesWithSolved = data.map(profile => ({
                    ...profile,
                    solved: solvedMap[profile.id]?.size || 0,
                    current_streak: profile.current_streak || 0,
                }));

                return profilesWithSolved
            }
        },
        retry: 1,
        refetchOnMount: 'always',
        refetchInterval: 30000,
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

    // Check if still loading due to debounce
    const isSearching = searchQuery !== debouncedSearch

    if (isLoading && !isSearching) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 animate-bounce text-4xl">🏆</div>
                    <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        console.error('Leaderboard error:', error)
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">❌</div>
                    <p className="text-red-500">Error loading leaderboard</p>
                    <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl px-8 py-8">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar + Founder Button */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => navigate('/u/saimbuilds')}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Meet the Founder
                    </Button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-3">
                    <Button
                        variant={selectedCategory === 'problems' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('problems')}
                        className={selectedCategory === 'problems'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500'
                            : 'hover:border-blue-500 hover:text-blue-400'
                        }
                    >
                        📊 PF Problems
                    </Button>
                    <Button
                        variant={selectedCategory === 'exams' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('exams')}
                        className={selectedCategory === 'exams'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500'
                            : 'hover:border-purple-500 hover:text-purple-400'
                        }
                    >
                        🎓 Mock Exams
                    </Button>
                </div>

                {/* University Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedUniversity === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedUniversity('all')}
                        className={selectedUniversity === 'all'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
                            : 'hover:border-purple-500 hover:text-purple-500'
                        }
                    >
                        <Users className="mr-2 h-4 w-4" />
                        All Universities
                    </Button>

                    {/* Show first 4 universities */}
                    {universities.slice(0, 4).map((uni) => (
                        <motion.div
                            key={uni.id}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Button
                                variant={selectedUniversity === uni.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedUniversity(uni.id)}
                                className={selectedUniversity === uni.id
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
                                    : 'hover:border-purple-500 hover:text-white'
                                }
                            >
                                {uni.short_name}
                            </Button>
                        </motion.div>
                    ))}

                    {/* Expandable universities */}
                    <AnimatePresence>
                        {showAllUniversities && universities.slice(4).map((uni, index) => (
                            <motion.div
                                key={uni.id}
                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Button
                                    variant={selectedUniversity === uni.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedUniversity(uni.id)}
                                    className={selectedUniversity === uni.id
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
                                        : 'hover:border-purple-500 hover:text-white'
                                    }
                                >
                                    {uni.short_name}
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Show More/Less Button */}
                    {universities.length > 4 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllUniversities(!showAllUniversities)}
                            className="border border-dashed border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10"
                        >
                            {showAllUniversities ? '− Show Less' : `+ ${universities.length - 4} More`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="mb-12 flex items-end justify-center gap-8">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-48 cursor-pointer"
                        onClick={() => navigate(`/u/${leaderboard[1].username}`)}
                    >
                        <Card className="border-2 border-gray-400/30 bg-gradient-to-br from-gray-400/10 to-transparent p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                            <Medal className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                            <div className="mb-2 text-4xl font-bold text-gray-400">2</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[1].full_name || leaderboard[1].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-2xl font-bold text-accent-blue">
                                {leaderboard[1].total_score}
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
                        className="w-48 cursor-pointer"
                        onClick={() => navigate(`/u/${leaderboard[0].username}`)}
                    >
                        <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-transparent p-6 text-center transition-all hover:scale-105 hover:shadow-2xl">
                            <Trophy className="mx-auto mb-3 h-16 w-16 text-yellow-400" />
                            <div className="mb-2 text-5xl font-bold text-yellow-400">1</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[0].full_name || leaderboard[0].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-3xl font-bold text-accent-blue">
                                {leaderboard[0].total_score}
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
                        className="w-48 cursor-pointer"
                        onClick={() => navigate(`/u/${leaderboard[2].username}`)}
                    >
                        <Card className="border-2 border-orange-600/30 bg-gradient-to-br from-orange-600/10 to-transparent p-6 text-center transition-all hover:scale-105 hover:shadow-xl">
                            <Award className="mx-auto mb-3 h-12 w-12 text-orange-600" />
                            <div className="mb-2 text-4xl font-bold text-orange-600">3</div>
                            <p className="mb-1 font-semibold text-foreground">
                                {leaderboard[2].full_name || leaderboard[2].email?.split('@')[0]}
                            </p>
                            <p className="mb-3 text-2xl font-bold text-accent-blue">
                                {leaderboard[2].total_score}
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
                                    {selectedCategory === 'exams' ? 'Exam Score' : 'Score'}
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">
                                    {selectedCategory === 'exams' ? 'Attempts' : 'Solved'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    {selectedCategory === 'exams' ? 'Best Score' : 'Streak'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    Department
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">
                                    University
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((profile, index) => {
                                const rank = index + 1
                                const isCurrentUser = profile.id === user?.id

                                return (
                                    <motion.tr
                                        onClick={() => navigate(`/u/${profile.username}`)}
                                        style={{ cursor: "pointer" }}
                                        key={profile.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`border-b border-border transition-colors hover:bg-muted ${isCurrentUser ? 'bg-purple-500/10' : ''
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
                                            <div className="flex items-center gap-3">
                                                {profile.avatar_url ? (
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt={profile.full_name || profile.username}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-lg"
                                                    style={{ display: profile.avatar_url ? 'none' : 'flex' }}
                                                >
                                                    {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '👤'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-foreground">
                                                            {profile.full_name || profile.email?.split('@')[0]}
                                                            {isCurrentUser && (
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    You
                                                                </Badge>
                                                            )}
                                                        </p>
                                                        {isCreator(profile.email) && <CreatorBadge />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {profile.university?.short_name || profile.department || 'N/A'}
                                                    </p>
                                                </div>
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
                                            <span className="text-sm text-foreground">
                                                {profile.department || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {profile.university?.short_name || 'N/A'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {leaderboard.length === 0 && !isLoading && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">🏆</div>
                        <p className="text-xl text-muted-foreground">No users found</p>
                        <p className="mt-2 text-sm text-muted">
                            {selectedUniversity !== 'all'
                                ? 'No users from this university yet. Make sure the migration was run!'
                                : 'Try adjusting your search'
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

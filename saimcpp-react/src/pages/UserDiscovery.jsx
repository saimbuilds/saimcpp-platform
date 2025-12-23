import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Search, Users } from 'lucide-react'

export default function UserDiscovery() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedUniversity, setSelectedUniversity] = useState('all')
    const [universities, setUniversities] = useState([])

    useEffect(() => {
        loadUniversities()
        loadTopUsers()
    }, [])

    const loadUniversities = async () => {
        const { data } = await supabase
            .from('universities')
            .select('*')
            .order('name')
        setUniversities(data || [])
    }

    const loadTopUsers = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('profiles')
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url,
                    total_score,
                    follower_count,
                    university:universities(short_name)
                `)
                .order('total_score', { ascending: false })
                .limit(50)

            const { data } = await query
            setUsers(data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = async (query) => {
        if (!query.trim()) {
            loadTopUsers()
            return
        }

        setLoading(true)
        try {
            let dbQuery = supabase
                .from('profiles')
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url,
                    total_score,
                    follower_count,
                    university:universities(short_name)
                `)

            // Filter by university if selected
            if (selectedUniversity !== 'all') {
                dbQuery = dbQuery.eq('university_id', selectedUniversity)
            }

            // Search by name or username
            const { data } = await dbQuery
                .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(50)

            setUsers(data || [])
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        const query = e.target.value
        setSearchQuery(query)
        searchUsers(query)
    }

    const filterByUniversity = async (universityId) => {
        setSelectedUniversity(universityId)
        setLoading(true)

        try {
            let query = supabase
                .from('profiles')
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url,
                    total_score,
                    follower_count,
                    university:universities(short_name)
                `)
                .order('total_score', { ascending: false })
                .limit(50)

            if (universityId !== 'all') {
                query = query.eq('university_id', universityId)
            }

            const { data } = await query
            setUsers(data || [])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto max-w-7xl px-8 py-8">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold">Discover Users</h1>
                <p className="text-muted-foreground">Find and follow other competitive programmers</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by name or username..."
                        className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 focus:border-accent-blue focus:outline-none"
                    />
                </div>

                {/* University Filter */}
                <select
                    value={selectedUniversity}
                    onChange={(e) => filterByUniversity(e.target.value)}
                    className="rounded-lg border border-border bg-secondary px-4 py-2 focus:border-accent-blue focus:outline-none"
                >
                    <option value="all">All Universities</option>
                    {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                            {uni.short_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* User Grid */}
            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-4xl">⚡</div>
                        <p className="text-muted-foreground">Searching...</p>
                    </div>
                </div>
            ) : users.length === 0 ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">😕</div>
                        <p className="text-xl text-muted-foreground">No users found</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="cursor-pointer p-6 transition-all hover:border-accent-blue hover:shadow-lg"
                                onClick={() => navigate(`/u/${user.username}`)}
                            >
                                <div className="flex items-center gap-4">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-2xl">
                                            👤
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            {user.full_name || user.username}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            @{user.username}
                                        </p>
                                        {user.university && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {user.university.short_name}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-bold text-accent-blue">
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

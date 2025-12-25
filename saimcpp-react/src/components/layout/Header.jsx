import { useState } from 'react'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/button'
import { LogOut, Code2, Trophy, User, Flame, BookOpen, DollarSign, MessageSquare } from 'lucide-react'
import FeedbackModal from '../FeedbackModal'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, profile, signOut } = useAuthStore()
    const [showFeedback, setShowFeedback] = useState(false)

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
                        Vexilot
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex gap-1">
                    <NavLink
                        to="/learning"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive || location.pathname.startsWith('/learning')
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <BookOpen className="h-4 w-4" />
                        Learning
                    </NavLink>
                    <NavLink
                        to="/leaderboard"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <Trophy className="h-4 w-4" />
                        Leaderboard
                    </NavLink>
                    <NavLink
                        to="/pricing"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <DollarSign className="h-4 w-4" />
                        Pricing
                    </NavLink>
                    <button
                        onClick={() => setShowFeedback(true)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Feedback
                    </button>
                </nav>

                {/* User Info with Dropdown */}
                <div className="relative flex items-center gap-4 group">
                    <div className="hidden items-center gap-3 text-sm md:flex">
                        <div className="flex items-center gap-1.5 rounded-lg bg-accent-green/10 px-3 py-1.5">
                            <Flame className="h-4 w-4 text-accent-green" />
                            <span className="font-semibold text-accent-green">{profile?.current_streak || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-accent-blue/10 px-3 py-1.5">
                            <Trophy className="h-4 w-4 text-accent-blue" />
                            <span className="font-semibold text-accent-blue">{profile?.total_score || 0}</span>
                        </div>

                        {/* User Name - Hoverable */}
                        <div className="relative cursor-pointer rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {profile?.full_name || user?.email?.split('@')[0]}
                                </span>
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="rounded-lg border border-border bg-card shadow-lg p-2">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        View Profile
                                    </button>
                                    <div className="my-1 h-px bg-border" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Logout */}
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="md:hidden">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Feedback Modal */}
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </header>
    )
}

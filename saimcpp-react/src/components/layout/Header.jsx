import { useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/button'
import { LogOut, Code2, Zap, Trophy, User, Flame } from 'lucide-react'

export default function Header() {
    const navigate = useNavigate()
    const { user, profile, signOut } = useAuthStore()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400">
                        <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">SaimCPP</span>
                </div>

                {/* Navigation */}
                <nav className="flex gap-1">
                    <NavLink
                        to="/problems"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <Code2 className="h-4 w-4" />
                        Problems
                    </NavLink>
                    <NavLink
                        to="/dry-run"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <Zap className="h-4 w-4" />
                        Dry Run
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
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`
                        }
                    >
                        <User className="h-4 w-4" />
                        Profile
                    </NavLink>
                </nav>

                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-3 text-sm md:flex">
                        <div className="flex items-center gap-1.5 rounded-lg bg-accent-green/10 px-3 py-1.5">
                            <Flame className="h-4 w-4 text-accent-green" />
                            <span className="font-semibold text-accent-green">{profile?.streak || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-accent-blue/10 px-3 py-1.5">
                            <Trophy className="h-4 w-4 text-accent-blue" />
                            <span className="font-semibold text-accent-blue">{profile?.total_score || 0}</span>
                        </div>
                        <span className="text-muted-foreground">
                            {profile?.full_name || user?.email?.split('@')[0]}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}

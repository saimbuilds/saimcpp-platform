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
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue shadow-lg shadow-brand-purple/20">
                        <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-xl font-bold text-transparent">
                        SaimCPP
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex gap-1">
                    <NavLink
                        to="/problems"
                        className={({ isActive }) =>
                            `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-brand-purple/10 text-brand-purple shadow-sm'
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
                            `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-brand-purple/10 text-brand-purple shadow-sm'
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
                            `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-brand-purple/10 text-brand-purple shadow-sm'
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
                            `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-brand-purple/10 text-brand-purple shadow-sm'
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
                        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-green/10 to-brand-green/5 px-4 py-2 shadow-sm">
                            <Flame className="h-4 w-4 text-brand-green" />
                            <span className="font-semibold text-brand-green">{profile?.streak || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 px-4 py-2 shadow-sm">
                            <Trophy className="h-4 w-4 text-brand-purple" />
                            <span className="font-semibold text-brand-purple">{profile?.score || 0}</span>
                        </div>
                        <span className="text-muted-foreground">
                            {profile?.full_name || user?.email?.split('@')[0]}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}

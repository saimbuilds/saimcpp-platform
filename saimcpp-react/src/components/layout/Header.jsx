import { useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/button'

export default function Header() {
    const navigate = useNavigate()
    const { user, profile, signOut } = useAuthStore()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const navItems = [
        { path: '/problems', label: 'Problems' },
        { path: '/dry-run', label: 'Dry Run' },
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/profile', label: 'Profile' },
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="flex items-center justify-between px-8 py-4">
                {/* Logo */}
                <h1 className="text-2xl font-bold text-accent-blue">SaimCPP</h1>

                {/* Navigation */}
                <nav className="flex gap-2">
                    {navItems.map(({ path, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-secondary text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-accent-blue">
                            {profile?.full_name || user?.email?.split('@')[0]}
                        </span>
                        <span className="font-semibold">
                            Streak: <span className="text-accent-green">{profile?.streak || 0}</span>
                        </span>
                        <span className="font-semibold">
                            Score: <span className="text-accent-blue">{profile?.score || 0}</span>
                        </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    )
}

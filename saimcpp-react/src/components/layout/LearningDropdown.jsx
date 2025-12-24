import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Code2, Zap, ChevronDown } from 'lucide-react'

export default function LearningDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const location = useLocation()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Check if any learning route is active
    const isLearningActive = location.pathname.startsWith('/learning')

    const tracks = [
        {
            id: 'pf',
            name: 'Programming Fundamentals',
            shortName: 'PF',
            items: [
                { name: 'Problems', path: '/learning/pf/problems', icon: Code2 },
                { name: 'Dry Runs', path: '/learning/pf/dry-runs', icon: Zap }
            ]
        },
        {
            id: 'op',
            name: 'Object-Oriented Programming',
            shortName: 'OP',
            items: [
                { name: 'Problems', path: '/learning/op/problems', icon: Code2 },
                { name: 'Dry Runs', path: '/learning/op/dry-runs', icon: Zap }
            ]
        }
    ]

    return (
        <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Dropdown Trigger */}
            <button
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isLearningActive
                        ? 'bg-accent-blue/10 text-accent-blue'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <BookOpen className="h-4 w-4" />
                Learning
                <ChevronDown
                    className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-card shadow-2xl">
                    <div className="p-2">
                        {tracks.map((track, trackIndex) => (
                            <div key={track.id}>
                                {/* Track Header */}
                                <div className="mb-1 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-purple-400 text-xs font-bold text-white">
                                            {track.shortName}
                                        </div>
                                        <span className="text-xs font-semibold text-foreground">
                                            {track.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Track Items */}
                                <div className="space-y-1">
                                    {track.items.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                                        ? 'bg-accent-blue/10 text-accent-blue font-medium'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`
                                                }
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.name}
                                            </NavLink>
                                        )
                                    })}
                                </div>

                                {/* Divider between tracks */}
                                {trackIndex < tracks.length - 1 && (
                                    <div className="my-2 border-t border-border" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Future tracks hint */}
                    <div className="border-t border-border bg-muted/30 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            More tracks coming soon...
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

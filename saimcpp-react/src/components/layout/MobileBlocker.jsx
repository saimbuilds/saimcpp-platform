import { useEffect, useState } from 'react'
import { Monitor, Code2, Trophy, Users, Zap, BookOpen, Target } from 'lucide-react'

export default function MobileBlocker() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!isMobile) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-background to-purple-900 p-6">
            <div className="max-w-2xl text-center">

                {/* Main Heading */}
                <div className="mb-4">
                    <h1 className="mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
                        Vexilot
                    </h1>
                    <p className="text-xl font-semibold text-white">
                        Competitive C++ Platform
                    </p>
                </div>

                {/* Desktop Only Message */}
                <div className="mb-8 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-sm">
                    <Monitor className="mx-auto mb-4 h-16 w-16 text-purple-400" />
                    <h2 className="mb-3 text-2xl font-bold text-white">Desktop Only</h2>
                    <p className="text-base text-gray-300">
                        Vexilot is designed exclusively for desktop use. Serious coding requires a proper keyboard, large screen, and focused environment.
                    </p>
                    <p className="mt-3 text-sm italic text-purple-300">
                        💻 Coding can't be done effectively on a phone!
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mb-8">
                    <h3 className="mb-6 text-xl font-semibold text-white">Platform Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <Code2 className="mx-auto mb-2 h-8 w-8 text-accent-blue" />
                            <p className="text-sm font-medium text-foreground">Practice Problems</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <Zap className="mx-auto mb-2 h-8 w-8 text-accent-yellow" />
                            <p className="text-sm font-medium text-foreground">Dry Run Challenges</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <Trophy className="mx-auto mb-2 h-8 w-8 text-accent-green" />
                            <p className="text-sm font-medium text-foreground">Live Leaderboard</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <Users className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                            <p className="text-sm font-medium text-foreground">Social Features</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <BookOpen className="mx-auto mb-2 h-8 w-8 text-pink-400" />
                            <p className="text-sm font-medium text-foreground">Learning Hub</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/20 bg-card/50 p-4 backdrop-blur-sm">
                            <Target className="mx-auto mb-2 h-8 w-8 text-orange-400" />
                            <p className="text-sm font-medium text-foreground">Real-time Scoring</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 backdrop-blur-sm">
                    <p className="mb-2 text-lg font-semibold text-white">
                        Ready to level up your C++ skills?
                    </p>
                    <p className="text-sm text-gray-300">
                        Visit Vexilot on your desktop or laptop to start your competitive programming journey!
                    </p>
                    <div className="mt-4 text-xs text-purple-300">
                        Learn • Practice • Compete
                    </div>
                </div>
            </div>
        </div>
    )
}

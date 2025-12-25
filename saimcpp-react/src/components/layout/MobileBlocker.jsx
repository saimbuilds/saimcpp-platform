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
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-background">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .feature-card {
                    transition: all 0.2s ease;
                }
                .feature-card:hover {
                    transform: translateY(-2px);
                    border-color: hsl(262 83% 58% / 0.5);
                    background-color: hsl(262 83% 58% / 0.05);
                }
            `}</style>

            <div className="min-h-screen flex items-center justify-center p-6 py-12">
                <div className="w-full max-w-lg space-y-12">
                    {/* Main Heading */}
                    <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
                        <h1 className="text-4xl font-semibold text-foreground tracking-tight sm:text-5xl">
                            Vexilot
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Competitive C++ Platform
                        </p>
                    </div>

                    {/* Desktop Only Message */}
                    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <div className="flex flex-col items-center text-center space-y-4 rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm">
                            <Monitor className="h-14 w-14 text-brand-purple sm:h-16 sm:w-16" />
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-foreground">Desktop Only</h2>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                                    Vexilot is designed exclusively for desktop use. Serious coding requires a proper keyboard, large screen, and focused environment.
                                </p>
                            </div>
                            <p className="text-sm text-brand-purple/80">
                                💻 Coding can't be done effectively on a phone
                            </p>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <h3 className="text-center text-lg font-medium text-foreground">Platform Features</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <Code2 className="mx-auto h-7 w-7 text-brand-blue" />
                                <p className="text-sm font-medium text-foreground">Practice Problems</p>
                            </div>
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <Zap className="mx-auto h-7 w-7 text-brand-orange" />
                                <p className="text-sm font-medium text-foreground">Dry Run Challenges</p>
                            </div>
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <Trophy className="mx-auto h-7 w-7 text-brand-green" />
                                <p className="text-sm font-medium text-foreground">Live Leaderboard</p>
                            </div>
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <Users className="mx-auto h-7 w-7 text-brand-purple" />
                                <p className="text-sm font-medium text-foreground">Social Features</p>
                            </div>
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <BookOpen className="mx-auto h-7 w-7 text-brand-pink" />
                                <p className="text-sm font-medium text-foreground">Learning Hub</p>
                            </div>
                            <div className="feature-card rounded-xl border border-border bg-card/30 p-4 text-center space-y-2">
                                <Target className="mx-auto h-7 w-7 text-brand-cyan" />
                                <p className="text-sm font-medium text-foreground">Real-time Scoring</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center space-y-3 rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-8 animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
                        <p className="text-lg font-medium text-foreground">
                            Ready to level up your C++ skills?
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Visit Vexilot on your desktop or laptop to start your competitive programming journey!
                        </p>
                        <div className="text-sm text-brand-purple pt-2">
                            Learn • Practice • Compete
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

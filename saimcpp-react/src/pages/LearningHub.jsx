import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Code2, Zap, BookOpen, Trophy, Rocket, FileText } from 'lucide-react'

const tracks = [
    {
        id: 'pf',
        name: 'Programming Fundamentals',
        description: 'Master the basics of C++ programming including arrays, pointers, functions, and memory management.',
        icon: '🎯',
        color: 'from-blue-600 to-blue-400',
        stats: { problems: 85, dryRuns: 45 }
    },
    {
        id: 'pf-lab',
        name: 'PF Lab Practice',
        description: 'Hands-on lab exercises for Programming Fundamentals. Practice problems designed for lab sessions.',
        icon: '🧪',
        color: 'from-cyan-600 to-cyan-400',
        stats: { problems: 46, dryRuns: 0 }
    },
    {
        id: 'op',
        name: 'Object-Oriented Programming',
        description: 'Learn OOP concepts including classes, inheritance, polymorphism, and encapsulation.',
        icon: '🏗️',
        color: 'from-purple-600 to-purple-400',
        stats: { problems: 0, dryRuns: 0 },
        comingSoon: true
    },
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        description: 'Coming soon! Deep dive into advanced data structures and algorithmic problem solving.',
        icon: '🚀',
        color: 'from-green-600 to-green-400',
        stats: { problems: 0, dryRuns: 0 },
        comingSoon: true
    }
]

export default function LearningHub() {
    const navigate = useNavigate()

    return (
        <div className="container mx-auto max-w-7xl px-8 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="mb-3 text-4xl font-bold">Learning Hub</h1>
                <p className="text-lg text-muted-foreground">
                    Choose your track and start mastering C++ programming
                </p>
            </div>

            {/* Ambassador Program Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <a
                    href="/ambassadors"
                    className="group block overflow-hidden rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-600/5 to-purple-400/5 p-4 transition-all hover:border-purple-500/40 hover:from-purple-600/10 hover:to-purple-400/10"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400">
                                <Rocket className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Campus Ambassador Program
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Earn 25% commission • Free premium access • Build your brand
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block rounded-full border border-purple-500/30 bg-purple-600/10 px-4 py-1.5 text-xs font-medium text-purple-400 transition-colors group-hover:bg-purple-600/20">
                            Apply Now →
                        </div>
                    </div>
                </a>
            </motion.div>

            {/* Tracks Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tracks.map((track, index) => (
                    <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className={`group relative overflow-hidden p-6 transition-all hover:shadow-xl ${track.comingSoon ? 'opacity-60' : ''}`}>
                            {/* Background Gradient */}
                            <div className={`absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br ${track.color} opacity-10 transition-all group-hover:scale-150`} />

                            {/* Content */}
                            <div className="relative">
                                {/* Track Header */}
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="text-5xl">{track.icon}</div>
                                    {track.comingSoon && (
                                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                            Coming Soon
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <h3 className="mb-2 text-xl font-bold">{track.name}</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {track.description}
                                </p>

                                {/* Stats */}
                                {!track.comingSoon && (
                                    <div className="mb-4 flex gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Code2 className="h-4 w-4 text-accent-blue" />
                                            <span className="font-medium">{track.stats.problems}</span>
                                            <span className="text-muted-foreground">Problems</span>
                                        </div>
                                        {track.id !== 'pf-lab' && (
                                            <div className="flex items-center gap-1.5">
                                                <Zap className="h-4 w-4 text-accent-green" />
                                                <span className="font-medium">{track.stats.dryRuns}</span>
                                                <span className="text-muted-foreground">Dry Runs</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {!track.comingSoon && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => navigate(`/learning/${track.id}/problems`)}
                                                className={track.id === 'pf-lab' ? 'flex-1' : 'flex-1'}
                                            >
                                                <Code2 className="mr-1.5 h-4 w-4" />
                                                Problems
                                            </Button>
                                            {track.id !== 'pf-lab' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/learning/${track.id}/dry-runs`)}
                                                    className="flex-1"
                                                >
                                                    <Zap className="mr-1.5 h-4 w-4" />
                                                    Dry Runs
                                                </Button>
                                            )}
                                        </div>
                                        {track.id === 'pf-lab' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate('/mock-exams')}
                                                className="w-full border-accent-purple text-accent-purple hover:bg-accent-purple/10"
                                            >
                                                <FileText className="mr-1.5 h-4 w-4" />
                                                Take Mock Exam
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Additional Resources Section (Future) */}
            <div className="mt-12 rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Trophy className="h-6 w-6 text-accent-blue" />
                    <h2 className="text-xl font-bold">More Learning Resources</h2>
                </div>
                <p className="text-muted-foreground">
                    Additional learning materials, tutorials, and resources will be added here soon.
                </p>
            </div>
        </div>
    )
}

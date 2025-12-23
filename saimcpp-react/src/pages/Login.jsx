import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { signInWithGoogle } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Chrome, Code2, Sparkles, Zap, Trophy } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const { user, initialized } = useAuthStore()

    useEffect(() => {
        if (initialized && user) {
            navigate('/problems')
        }
    }, [user, initialized, navigate])

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error('Login error:', error)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted p-4">
            {/* Animated Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-accent-blue/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent-green/10 blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo Section */}
                <motion.div
                    className="mb-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <motion.div
                        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-blue via-accent-green to-accent-blue shadow-2xl shadow-accent-blue/20"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Code2 className="h-14 w-14 text-white" />
                    </motion.div>

                    <motion.h1
                        className="mb-3 bg-gradient-to-r from-accent-blue via-accent-green to-accent-blue bg-clip-text text-5xl font-bold text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        SaimCPP
                    </motion.h1>

                    <motion.p
                        className="text-lg text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Master Competitive Programming
                    </motion.p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Card className="border-2 border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">Welcome Back!</h2>
                                <p className="text-sm text-muted-foreground">
                                    Sign in to continue your learning journey
                                </p>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                className="group relative w-full overflow-hidden bg-white py-6 text-base font-semibold text-gray-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
                                size="lg"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-green/10"
                                    initial={{ x: '100%' }}
                                    whileHover={{ x: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <Chrome className="mr-3 h-5 w-5 text-blue-500" />
                                Continue with Google
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                By continuing, you agree to our Terms of Service
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Feature Stats */}
                <motion.div
                    className="mt-8 grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <motion.div
                        className="group cursor-pointer rounded-xl border border-border/50 bg-card/30 p-4 text-center backdrop-blur-sm transition-all hover:bg-card/50 hover:shadow-lg"
                        whileHover={{ y: -5, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="mb-1 flex items-center justify-center">
                            <Code2 className="h-5 w-5 text-accent-blue transition-transform group-hover:scale-110" />
                        </div>
                        <div className="text-2xl font-bold text-accent-blue">217</div>
                        <div className="text-xs text-muted-foreground">Problems</div>
                    </motion.div>

                    <motion.div
                        className="group cursor-pointer rounded-xl border border-border/50 bg-card/30 p-4 text-center backdrop-blur-sm transition-all hover:bg-card/50 hover:shadow-lg"
                        whileHover={{ y: -5, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="mb-1 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-accent-green transition-transform group-hover:scale-110" />
                        </div>
                        <div className="text-2xl font-bold text-accent-green">30</div>
                        <div className="text-xs text-muted-foreground">Dry Runs</div>
                    </motion.div>

                    <motion.div
                        className="group cursor-pointer rounded-xl border border-border/50 bg-card/30 p-4 text-center backdrop-blur-sm transition-all hover:bg-card/50 hover:shadow-lg"
                        whileHover={{ y: -5, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="mb-1 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-accent-yellow transition-transform group-hover:scale-110" />
                        </div>
                        <div className="text-2xl font-bold text-accent-yellow">Live</div>
                        <div className="text-xs text-muted-foreground">Ranks</div>
                    </motion.div>
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Sparkles className="h-4 w-4 text-accent-yellow" />
                    <span>Join 300+ competitive programmers</span>
                </motion.div>
            </motion.div>
        </div>
    )
}

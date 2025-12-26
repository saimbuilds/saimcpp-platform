import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { signInWithGoogle } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Chrome, Sparkles } from 'lucide-react'

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
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
            {/* Subtle gradient orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl"
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </motion.div>

                    <h1 className="mb-2 text-3xl font-bold tracking-tight">
                        Welcome to Vexilot
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Master competitive programming with AI-powered insights
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Card className="border border-border/50 bg-card/50 p-8 shadow-xl backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h2 className="text-xl font-semibold">Sign in to continue</h2>
                                <p className="text-sm text-muted-foreground">
                                    One click to access 200+ problems
                                </p>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                className="group relative w-full overflow-hidden bg-white py-6 text-base font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                                size="lg"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50"
                                    initial={{ x: '100%' }}
                                    whileHover={{ x: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <div className="relative flex items-center justify-center gap-3">
                                    <Chrome className="h-5 w-5 text-blue-600" />
                                    <span>Continue with Google</span>
                                </div>
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Join Pakistani students
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">200+</div>
                                    <div className="text-xs text-muted-foreground">Problems</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">45</div>
                                    <div className="text-xs text-muted-foreground">Dry Runs</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">Live</div>
                                    <div className="text-xs text-muted-foreground">Ranks</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="mt-8 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Start practicing today • Upgrade anytime</span>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{' '}
                        <a href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { signInWithGoogle } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export default function Login() {
    const navigate = useNavigate()
    const { user, loading } = useAuthStore()

    useEffect(() => {
        if (user && !loading) {
            navigate('/')
        }
    }, [user, loading, navigate])

    const handleGoogleSignIn = async () => {
        await signInWithGoogle()
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <h1 className="mb-3 bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-6xl font-bold text-transparent">
                    SaimCPP
                </h1>
                <p className="text-xl font-medium text-muted-foreground">
                    Grind. Compete. Conquer C++
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="w-full max-w-md p-8 shadow-2xl">
                    <h2 className="mb-6 text-center text-2xl font-semibold">
                        Welcome to SaimCPP
                    </h2>
                    <p className="mb-8 text-center text-sm text-muted-foreground">
                        Sign in with Google to start solving C++ problems
                    </p>

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-2 bg-white text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                        onClick={handleGoogleSignIn}
                    >
                        <svg
                            className="mr-3 h-5 w-5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </Button>

                    <p className="mt-6 text-center text-xs text-muted">
                        First-time users: You'll be asked for batch & department
                    </p>
                </Card>
            </motion.div>
        </div>
    )
}

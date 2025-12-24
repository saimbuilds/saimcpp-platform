import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import ProblemEditor from './pages/ProblemEditor'
import DryRun from './pages/DryRun'
import DryRunEditor from './pages/DryRunEditor'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import UniversityOnboarding from './pages/UniversityOnboarding'
import UserProfile from './pages/UserProfile'
import UserDiscovery from './pages/UserDiscovery'
import EditProfile from './pages/EditProfile'
import FollowersPage from './pages/FollowersPage'
import LearningHub from './pages/LearningHub'

// Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
})

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

function App() {
    const initialize = useAuthStore((state) => state.initialize)

    useEffect(() => {
        initialize()
    }, [initialize])

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            useAuthStore.getState().user ? (
                                <Navigate to="/learning" replace />
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/learning" replace />} />
                        <Route path="learning" element={<LearningHub />} />
                        <Route path="learning/:track/problems" element={<Problems />} />
                        <Route path="learning/:track/dry-runs" element={<DryRun />} />
                        {/* Redirects from old routes */}
                        <Route path="problems" element={<Navigate to="/learning/pf/problems" replace />} />
                        <Route path="dry-run" element={<Navigate to="/learning/pf/dry-runs" replace />} />
                        <Route path="leaderboard" element={<Leaderboard />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="/discover" element={<UserDiscovery />} />
                    <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                    <Route path="/u/:username/:type" element={<FollowersPage />} />
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <UniversityOnboarding />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/u/:username" element={<UserProfile />} />
                    <Route
                        path="/problem/:id"
                        element={
                            <ProtectedRoute>
                                <ProblemEditor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dry-run/:id"
                        element={
                            <ProtectedRoute>
                                <DryRunEditor />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App

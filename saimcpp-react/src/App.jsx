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
import   MockExams from './pages/MockExams'
import ExamInstructions from './pages/ExamInstructions'
import ExamInterface from './pages/ExamInterface'
import Pricing from './pages/Pricing'
import AmbassadorProgram from './pages/AmbassadorProgram'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

// Components
import MobileBlocker from './components/layout/MobileBlocker'
import OnboardingGuard from './components/OnboardingGuard'

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

    // ✅ GLOBAL SECURITY - Disable right-click and DevTools across entire app
    useEffect(() => {
        const preventContextMenu = (e) => e.preventDefault();

        const preventDevTools = (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
                (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventDevTools);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventDevTools);
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <MobileBlocker />
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
                    <Route path="/onboarding" element={
                        <ProtectedRoute>
                            <UniversityOnboarding />
                        </ProtectedRoute>
                    } />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <OnboardingGuard>
                                    <Dashboard />
                                </OnboardingGuard>
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
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="mock-exams" element={<MockExams />} />
                    </Route>

                    {/* Standalone Protected Routes (No Dashboard Layout) */}
                    <Route
                        path="/mock-exam/:examId/instructions"
                        element={
                            <ProtectedRoute>
                                <OnboardingGuard>
                                    <ExamInstructions />
                                </OnboardingGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mock-exam/:examId/exam"
                        element={
                            <ProtectedRoute>
                                <OnboardingGuard>
                                    <ExamInterface />
                                </OnboardingGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/discover" element={<UserDiscovery />} />
                    <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                    <Route path="/u/:username/:type" element={<FollowersPage />} />
                    <Route path="/u/:username" element={<UserProfile />} />
                    <Route path="/ambassadors" element={<AmbassadorProgram />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
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

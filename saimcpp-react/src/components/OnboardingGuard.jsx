import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OnboardingGuard({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, profile, initialized } = useAuthStore()

    useEffect(() => {
        if (initialized && user && profile) {
            // Check if onboarding is needed (empty or null batch/department/campus)
            const needsOnboarding = !profile.batch || !profile.department || !profile.campus ||
                profile.batch === '' || profile.department === '' || profile.campus === '' ||
                profile.batch === null || profile.department === null || profile.campus === null

            const isOnOnboardingPage = location.pathname === '/onboarding'

            // Only redirect if user needs onboarding AND is not already on the onboarding page
            if (needsOnboarding && !isOnOnboardingPage) {
                console.log('🔐 [ONBOARDING] User needs onboarding - redirecting')
                navigate('/onboarding', { replace: true })
            } else if (!needsOnboarding && isOnOnboardingPage) {
                // If user is already onboarded but somehow on onboarding page, redirect to learning
                console.log('🔐 [ONBOARDING] User already onboarded - redirecting to learning')
                navigate('/learning', { replace: true })
            }
        }
    }, [user, profile, initialized, location.pathname, navigate])

    return children
}

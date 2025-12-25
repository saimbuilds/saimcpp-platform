import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OnboardingGuard({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, profile, initialized } = useAuthStore()

    useEffect(() => {
        if (initialized && user && profile) {
            // Check if profile is complete
            // Required fields: full_name, department, campus
            const isProfileComplete =
                profile.full_name && profile.full_name.trim() !== '' &&
                profile.department && profile.department.trim() !== '' &&
                profile.campus && profile.campus.trim() !== '';

            const isOnOnboardingPage = location.pathname === '/onboarding'

            // Redirect to onboarding if profile incomplete AND not already on onboarding page
            if (!isProfileComplete && !isOnOnboardingPage) {
                console.log('🔐 [ONBOARDING] Profile incomplete - redirecting to onboarding')
                navigate('/onboarding', { replace: true })
            } else if (isProfileComplete && isOnOnboardingPage) {
                // If profile is complete but somehow on onboarding page, redirect to learning
                console.log('🔐 [ONBOARDING] Profile complete - redirecting to learning')
                navigate('/learning', { replace: true })
            }
        }
    }, [user, profile, initialized, location.pathname, navigate])

    return children
}

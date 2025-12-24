import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Globe, GraduationCap, Calendar, Building2 } from 'lucide-react'

const PAKISTANI_UNIVERSITIES = [
    'National University of Sciences and Technology (NUST)',
    'COMSATS University Islamabad',
    'Lahore University of Management Sciences (LUMS)',
    'University of Engineering and Technology (UET) Lahore',
    'Pakistan Institute of Engineering and Applied Sciences (PIEAS)',
    'FAST National University of Computer and Emerging Sciences',
    'Ghulam Ishaq Khan Institute (GIKI)',
    'Information Technology University (ITU) Lahore',
    'Air University Islamabad',
    'Bahria University',
    'NED University of Engineering and Technology',
    'Mehran University of Engineering and Technology',
    'University of Karachi',
    'University of the Punjab',
    'Quaid-i-Azam University',
    'Other'
]

// Campus options for each university
const UNIVERSITY_CAMPUSES = {
    'FAST National University of Computer and Emerging Sciences': ['Lahore', 'Islamabad', 'Karachi', 'Peshawar', 'Faisalabad', 'Chiniot'],
    'COMSATS University Islamabad': ['Islamabad', 'Lahore', 'Abbottabad', 'Attock', 'Sahiwal', 'Vehari', 'Wah'],
    'Bahria University': ['Islamabad', 'Karachi', 'Lahore'],
    'Air University': ['Islamabad', 'Multan', 'Kamra'],
    'University of Engineering and Technology (UET) Lahore': ['Lahore', 'Narowal', 'Faisalabad', 'Taxila'],
    'National University of Sciences and Technology (NUST)': ['Islamabad', 'Risalpur', 'Quetta'],
    // Add 'Main Campus' for universities without multiple campuses
    'default': ['Main Campus']
}

const DEPARTMENTS = [
    'Computer Science',
    'Software Engineering',
    'Artificial Intelligence',
    'Data Science',
    'Computer Engineering',
    'Information Technology',
    'Cyber Security',
    'Other'
]

const BATCH_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5)

export default function UniversityOnboarding() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [country, setCountry] = useState('Detecting...')
    const [showCustomUniversity, setShowCustomUniversity] = useState(false)
    const [formData, setFormData] = useState({
        university: '',
        customUniversity: '',
        campus: '',
        department: '',
        batch: '',
        country: ''
    })

    // Pre-fill form with existing profile data
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                department: profile.department || '',
                batch: profile.batch || '',
                campus: profile.campus || ''
            }))
        }
    }, [profile])

    // Check if user is already onboarded - redirect if yes
    useEffect(() => {
        if (profile) {
            const isOnboarded = profile.batch && profile.department && profile.campus &&
                profile.batch !== '' && profile.department !== '' && profile.campus !== '' &&
                profile.batch !== null && profile.department !== null && profile.campus !== null

            if (isOnboarded) {
                console.log('🔐 [ONBOARDING] User already onboarded - redirecting to learning')
                navigate('/learning', { replace: true })
            }
        }
    }, [profile, navigate])

    // Auto-detect country
    useEffect(() => {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                const detectedCountry = data.country_name || 'Pakistan'
                setCountry(detectedCountry)
                setFormData(prev => ({ ...prev, country: detectedCountry }))
            })
            .catch(() => {
                setCountry('Pakistan')
                setFormData(prev => ({ ...prev, country: 'Pakistan' }))
            })
    }, [])

    const handleUniversityChange = (e) => {
        const value = e.target.value
        const isOther = value === 'Other'
        setFormData({ ...formData, university: value, campus: '' }) // Reset campus when university changes
        setShowCustomUniversity(isOther)
    }

    // Get campus options for selected university
    const getCampusOptions = () => {
        if (showCustomUniversity || !formData.university) return []
        return UNIVERSITY_CAMPUSES[formData.university] || UNIVERSITY_CAMPUSES['default']
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const finalUniversity = showCustomUniversity ? formData.customUniversity : formData.university

            if (!finalUniversity || !formData.department || !formData.batch) {
                alert('Please fill all fields')
                setLoading(false)
                return
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    university_id: null, // You can map university to ID later
                    batch: formData.batch,
                    department: formData.department,
                    campus: formData.campus || 'Main Campus'
                })
                .eq('id', user.id)

            if (error) throw error

            // Reload profile
            const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            useAuthStore.getState().setProfile(updatedProfile)

            navigate('/learning', { replace: true })
        } catch (error) {
            console.error('Onboarding error:', error)
            alert('Failed to save profile: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/10 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-2 border-purple-500/20 p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 shadow-lg shadow-purple-500/30">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                            Welcome to Vexilot!
                        </h1>
                        <p className="text-muted-foreground">
                            Let's set up your profile to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Country (Auto-detected) */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Globe className="h-4 w-4 text-purple-500" />
                                Country
                            </label>
                            <div className="flex h-12 items-center rounded-xl border-2 border-purple-500/20 bg-secondary px-4 text-muted-foreground">
                                {country}
                            </div>
                        </div>

                        {/* University */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Building2 className="h-4 w-4 text-purple-500" />
                                University
                            </label>
                            <Select
                                value={formData.university}
                                onChange={handleUniversityChange}
                                required
                            >
                                <option value="">Select your university</option>
                                {PAKISTANI_UNIVERSITIES.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))}
                            </Select>

                            {showCustomUniversity && (
                                <motion.input
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    type="text"
                                    value={formData.customUniversity}
                                    onChange={(e) => setFormData({ ...formData, customUniversity: e.target.value })}
                                    placeholder="Enter your university name"
                                    className="mt-3 flex h-12 w-full rounded-xl border-2 border-purple-500/20 bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    required
                                />
                            )}
                        </div>

                        {/* Campus */}
                        {formData.university && !showCustomUniversity && getCampusOptions().length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                    <Building2 className="h-4 w-4 text-purple-500" />
                                    Campus
                                </label>
                                <Select
                                    value={formData.campus}
                                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                                    required
                                >
                                    <option value="">Select your campus</option>
                                    {getCampusOptions().map(campus => (
                                        <option key={campus} value={campus}>{campus}</option>
                                    ))}
                                </Select>
                            </motion.div>
                        )}

                        {/* Department */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                                Department
                            </label>
                            <Select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            >
                                <option value="">Select your department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Batch Year */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                Batch Year
                            </label>
                            <Select
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                required
                            >
                                <option value="">Select your batch year</option>
                                {BATCH_YEARS.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 py-6 text-base font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-purple-600"
                        >
                            {loading ? 'Setting up...' : 'Complete Setup 🚀'}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div >
    )
}

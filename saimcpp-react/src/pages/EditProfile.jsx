import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Linkedin, Github, Twitter, Globe, Save, X } from 'lucide-react'

export default function EditProfile() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        bio: '',
        linkedin_url: '',
        github_url: '',
        twitter_url: '',
        portfolio_url: '',
        is_profile_public: true
    })

    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || '',
                linkedin_url: profile.linkedin_url || '',
                github_url: profile.github_url || '',
                twitter_url: profile.twitter_url || '',
                portfolio_url: profile.portfolio_url || '',
                is_profile_public: profile.is_profile_public !== false
            })
        }
    }, [profile])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            console.log('Updating profile:', formData)

            const { data, error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', user.id)
                .select()

            if (error) throw error

            console.log('Update successful:', data)

            // Show success message
            alert('✅ Profile updated successfully!')

            // Navigate back to Learning Hub
            navigate('/learning', { replace: true })
        } catch (error) {
            console.error('Update error:', error)
            alert('❌ Failed to update profile: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!user || !profile) {
        return null
    }

    return (
        <div className="container mx-auto max-w-3xl px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold">Edit Profile</h1>
                    <p className="text-muted-foreground">
                        Update your bio, social links, and privacy settings
                    </p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Bio */}
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Bio
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell others about yourself..."
                                    rows={4}
                                    maxLength={200}
                                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formData.bio.length}/200 characters
                                </p>
                            </div>

                            {/* Social Links */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Social Links</h3>

                                {/* LinkedIn */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedin_url}
                                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {/* GitHub */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.github_url}
                                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                        placeholder="https://github.com/username"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {/* Twitter */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Twitter className="h-4 w-4" />
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.twitter_url}
                                        onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                        placeholder="https://twitter.com/username"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {/* Portfolio */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Globe className="h-4 w-4" />
                                        Portfolio/Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.portfolio_url}
                                        onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                        placeholder="https://yourwebsite.com"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="rounded-lg border border-border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Public Profile</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Allow others to view your profile
                                        </p>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_profile_public}
                                            onChange={(e) => setFormData({ ...formData, is_profile_public: e.target.checked })}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/learning', { replace: true })}
                                    className="hover:border-purple-500"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

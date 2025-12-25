import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Sparkles, Zap, Crown, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'

export default function AmbassadorProgram() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        university: '',
        batch: '',
        whyJoin: '',
        expectedReach: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('ambassador_applications')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        university: formData.university,
                        batch: formData.batch,
                        why_join: formData.whyJoin,
                        expected_reach: parseInt(formData.expectedReach)
                    }
                ])

            if (error) throw error

            setSubmitted(true)
        } catch (error) {
            console.error('Error submitting application:', error)
            alert('Failed to submit application. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 via-background to-background p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                        <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="mb-3 text-4xl font-bold">you're in! 🎉</h2>
                    <p className="mb-6 max-w-md text-muted-foreground">
                        we'll review your application and hit you up within 48 hours
                    </p>
                    <Button onClick={() => window.location.href = '/learning'} size="lg">
                        back to grinding
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
            {/* Hero */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

                <div className="container relative mx-auto max-w-5xl px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400">
                            <Sparkles className="h-4 w-4" />
                            limited spots available
                        </div>

                        <h1 className="mb-6 text-6xl font-black leading-tight tracking-tight md:text-7xl">
                            <span className="bg-gradient-to-r from-[#9333ea] via-[#7c3aed] to-[#6b21a8] bg-clip-text text-transparent">
                                get paid
                            </span>
                            <br />
                            <span className="text-foreground">to help your peers</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-xl font-light text-muted-foreground">
                            earn 25% commission. get free premium. build your brand.
                            <br />
                            <span className="text-base">no experience required. we'll teach you everything.</span>
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                <span>25% commission</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-purple-400" />
                                <span>free premium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                <span>exclusive perks</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits - Bento Grid Style */}
            <section className="py-16">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'earn real money',
                                desc: '25% commission on every premium signup',
                                color: 'from-green-500/20 to-emerald-500/20',
                                border: 'border-green-500/30'
                            },
                            {
                                title: 'free premium forever',
                                desc: 'lifetime access while you\'re active',
                                color: 'from-purple-500/20 to-purple-600/20',
                                border: 'border-purple-500/30'
                            },
                            {
                                title: 'build your brand',
                                desc: 'certificate + linkedin badge + opportunities',
                                color: 'from-blue-500/20 to-cyan-500/20',
                                border: 'border-blue-500/30'
                            }
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className={`border ${benefit.border} bg-gradient-to-br ${benefit.color} p-6 backdrop-blur-sm`}>
                                    <h3 className="mb-2 text-lg font-bold">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Requirements */}
            <section className="py-16">
                <div className="container mx-auto max-w-4xl px-6">
                    <h2 className="mb-12 text-center text-3xl font-bold">who can apply?</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            { title: 'student in any computing field', desc: 'CS, IT, SE, or related' },
                            { title: 'active online or on campus', desc: 'social media, groups, or communities' },
                            { title: 'want to help others win', desc: 'genuinely care about student success' },
                            { title: 'ready to take action', desc: 'we provide training, you bring the energy' }
                        ].map((req, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-[#6b21a8]/30 bg-[#1a0b2e]/50 p-5 backdrop-blur-sm transition-all hover:border-[#6b21a8]/50">
                                    <h3 className="mb-1 text-sm font-semibold text-[#9333ea]">{req.title}</h3>
                                    <p className="text-sm font-light text-muted-foreground">{req.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="py-16">
                <div className="container mx-auto max-w-2xl px-6">
                    <div className="mb-8 text-center">
                        <h2 className="mb-3 text-3xl font-bold tracking-tight">ready to start?</h2>
                        <p className="font-light text-muted-foreground">takes 2 minutes. we'll respond within 24 hours.</p>
                    </div>

                    <Card className="border-purple-500/20 bg-card/50 p-8 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium">your name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="john doe"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="john@university.edu"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">university</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="FAST-NUCES"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">batch year</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.batch}
                                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="2024"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">why do you want to join?</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.whyJoin}
                                    onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="i want to help my peers succeed and earn some money while doing it..."
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">how many students can you reach?</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.expectedReach}
                                    onChange={(e) => setFormData({ ...formData, expectedReach: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="50"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    whatsapp groups, instagram followers, etc.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6b21a8] py-6 text-base font-bold tracking-wide hover:from-[#6b21a8] hover:to-[#581c87]"
                            >
                                {submitting ? 'submitting...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        apply now <ArrowRight className="h-5 w-5" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </section>
        </div>
    )
}

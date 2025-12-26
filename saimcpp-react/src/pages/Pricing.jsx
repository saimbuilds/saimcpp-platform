import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Building2 } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function Pricing() {
    const { profile } = useAuthStore()
    const [email, setEmail] = useState(profile?.email || '')
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleWaitlistSignup = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email, full_name: fullName }])

            if (error) {
                if (error.code === '23505') {
                    alert('You\'re already on the waitlist!')
                } else {
                    throw error
                }
            } else {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 5000)
            }
        } catch (error) {
            console.error('Waitlist signup error:', error)
            alert('Failed to join waitlist. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const tiers = [
        {
            name: 'Free',
            price: 'Free',
            description: 'For students getting started',
            features: [
                'Unlimited problem solving',
                'Unlimited mock exams',
                'Basic leaderboards',
                'Profile & achievements',
            ],
            cta: 'Current Plan',
            current: true
        },
        {
            name: 'Professional',
            price: 'Coming Soon',
            description: 'For serious competitors',
            features: [
                'Everything in Free',
                'Custom private rooms',
                'AI-powered code review',
                'Live competitions & prizes',
                'Advanced analytics & insights',
                'Priority support'
            ],
            cta: 'Join Waitlist',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For universities & institutions',
            features: [
                'Everything in Professional',
                'Custom problem creation',
                'University portal & analytics',
                'Dedicated competitions',
                'Custom branding',
                'SSO & LMS integration'
            ],
            cta: 'Contact Us',
            enterprise: true
        }
    ]

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center"
                >
                    <h1 className="mb-4 text-5xl font-bold tracking-tight">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Practice for free. Compete like a pro with AI-powered insights.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`relative overflow-hidden p-8 h-full flex flex-col ${tier.popular
                                ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/10'
                                : 'border border-border'
                                }`}>
                                {tier.popular && (
                                    <div className="absolute right-4 top-4 rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Header */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-4xl font-bold tracking-tight">
                                            {tier.price}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="mb-8 flex-1 space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className="h-5 w-5 shrink-0 text-purple-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {tier.current ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled
                                    >
                                        {tier.cta}
                                    </Button>
                                ) : tier.enterprise ? (
                                    <Button
                                        variant="outline"
                                        className="w-full group"
                                        onClick={() => window.location.href = 'mailto:vexilot.dev@gmail.com?subject=Enterprise Inquiry'}
                                    >
                                        {tier.cta}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                ) : (
                                    <>
                                        {success ? (
                                            <div className="rounded-lg bg-green-500/10 p-4 text-center text-sm text-green-400">
                                                ✓ You're on the waitlist!
                                            </div>
                                        ) : (
                                            <form onSubmit={handleWaitlistSignup} className="space-y-3">
                                                <Input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                    className="h-10"
                                                />
                                                <Input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="h-10"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                                >
                                                    {loading ? 'Joining...' : tier.cta}
                                                </Button>
                                            </form>
                                        )}
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ/Contact */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 text-center"
                >
                    <p className="text-sm text-muted-foreground">
                        Questions?{' '}
                        <a
                            href="mailto:vexilot.dev@gmail.com"
                            className="text-foreground hover:text-purple-500 transition-colors"
                        >
                            Get in touch
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

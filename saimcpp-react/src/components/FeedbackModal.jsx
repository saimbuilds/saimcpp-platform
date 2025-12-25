import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Send, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function FeedbackModal({ isOpen, onClose }) {
    const { user } = useAuthStore()
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [message, setMessage] = useState('')
    const [category, setCategory] = useState('general')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!rating || !message.trim()) {
            alert('Please provide a rating and message')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([{
                    user_id: user.id,
                    rating,
                    message: message.trim(),
                    category
                }])

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
                // Reset form
                setRating(0)
                setMessage('')
                setCategory('general')
            }, 2000)
        } catch (error) {
            console.error('Feedback submission error:', error)
            alert('Failed to submit feedback. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            {/* Backdrop - Full screen blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-lg"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Modal Container - Centered in viewport */}
            <div
                className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2"
                style={{ position: 'fixed' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-[90vw] max-w-md rounded-2xl border-2 border-purple-500/20 bg-background p-6 shadow-2xl shadow-purple-500/20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-purple-500/10 hover:text-purple-400"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {success ? (
                        // Success State
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-8 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
                            >
                                <Send className="h-8 w-8 text-green-400" />
                            </motion.div>
                            <h3 className="mb-2 text-xl font-bold">Thank you!</h3>
                            <p className="text-muted-foreground">
                                Your feedback helps us improve Vexilot
                            </p>
                        </motion.div>
                    ) : (
                        // Form State
                        <>
                            <div className="mb-6">
                                <div className="mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-6 w-6 text-purple-500" />
                                    <h2 className="text-2xl font-bold">Share Feedback</h2>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Help us make Vexilot better for everyone
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Rating */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        How would you rate your experience?
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-muted-foreground'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-lg border-2 border-purple-500/20 bg-background px-4 py-2 focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="general">General Feedback</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Your feedback
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us what you think..."
                                        rows={4}
                                        className="w-full rounded-lg border-2 border-purple-500/20 bg-background px-4 py-2 focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading || !rating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500"
                                >
                                    {loading ? 'Sending...' : 'Submit Feedback'}
                                </Button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}

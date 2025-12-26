import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { loadDryRunProblems } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react'

export default function DryRunEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [answer, setAnswer] = useState('')
    const [output, setOutput] = useState('')
    const [showExplanation, setShowExplanation] = useState(false)
    const [hasViewedExplanation, setHasViewedExplanation] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    // Load all dry run problems
    const { data: dryRuns = [] } = useQuery({
        queryKey: ['dry-runs'],
        queryFn: loadDryRunProblems,
    })

    const problem = dryRuns.find((p) => p.id === parseInt(id))

    // Check if user already has an accepted submission
    useEffect(() => {
        const checkExistingSubmission = async () => {
            if (!user || !id) return

            const { data, error } = await supabase
                .from('submissions')
                .select('status')
                .eq('user_id', user.id)
                .eq('problem_id', id)
                .eq('status', 'accepted')
                .limit(1)

            if (!error && data && data.length > 0) {
                setHasSubmitted(true)
                setOutput('✅ You have already solved this dry run!')
            }
        }

        checkExistingSubmission()
    }, [user, id])

    // Load saved answer from localStorage
    useEffect(() => {
        if (problem) {
            const savedAnswer = localStorage.getItem(`dryrun-${id}-answer`)
            if (savedAnswer) {
                setAnswer(savedAnswer)
            }
        }
    }, [problem, id])

    // Auto-save answer
    useEffect(() => {
        if (answer && problem) {
            localStorage.setItem(`dryrun-${id}-answer`, answer)
        }
    }, [answer, id, problem])

    // Toggle explanation
    const handleToggleExplanation = () => {
        if (!showExplanation) {
            setHasViewedExplanation(true)
        }
        setShowExplanation(!showExplanation)
    }


    // Submit answer
    const handleSubmit = async () => {
        if (!user || !problem || hasSubmitted) return

        setIsSubmitting(true)
        setOutput('Checking...')

        try {
            const expectedOutput = (problem.expectedOutput || '').trim()
            const userAnswer = answer.trim()
            const passed = userAnswer === expectedOutput

            // Calculate points (0 if viewed explanation)
            const points = hasViewedExplanation ? 0 : (passed ? (problem.points || 5) : 0)

            // Save submission
            await supabase.from('submissions').insert([{
                user_id: user.id,
                problem_id: problem.id,
                code: answer,
                status: passed ? 'accepted' : 'wrong_answer',
                test_cases_passed: passed ? 1 : 0,
                test_cases_total: 1,
                points_earned: points,
            }])

            if (passed) {
                // Update user score
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_score')
                    .eq('id', user.id)
                    .single()

                await supabase
                    .from('profiles')
                    .update({ total_score: (profile?.total_score || 0) + points })
                    .eq('id', user.id)

                setHasSubmitted(true)

                if (hasViewedExplanation) {
                    setOutput(`✅ Correct!\n\nHowever, you viewed the explanation before submitting, so you earned 0 points.`)
                } else {
                    setOutput(`✅ Correct!\n\nYou earned ${points} points!`)
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 3000)
                }
            } else {
                setOutput(`❌ Incorrect\n\nExpected:\n${expectedOutput}\n\nYour answer:\n${userAnswer}`)
            }
        } catch (error) {
            setOutput(`Submission failed: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!problem) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading dry run...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Success Popup - Professional Minimalist */}
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed left-1/2 top-8 z-50 -translate-x-1/2 transform"
                >
                    <Card className="border border-green-500/20 bg-white dark:bg-gray-900 px-6 py-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Correct!</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Well done</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            <div className="grid h-full grid-cols-2">
                {/* Left Panel - Code Display */}
                <div className="flex flex-col border-r border-border bg-card">
                    <div className="border-b border-border p-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dry-run')}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dry Run
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold">{problem.title}</h1>
                                <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <div>🎯 {problem.points || 5} points</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Description</h3>
                                <p className="text-muted-foreground">
                                    {problem.description || 'Trace the code and predict the exact output.'}
                                </p>
                            </section>

                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Code to Trace</h3>
                                <div className="overflow-hidden rounded-lg border border-border">
                                    <Editor
                                        height="400px"
                                        defaultLanguage="cpp"
                                        value={problem.code || '// No code provided'}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            fontSize: 16,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Answer Input */}
                <div className="flex flex-col bg-background">
                    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                        <span className="text-sm font-medium">Your Answer</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleExplanation}
                            >
                                {showExplanation ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Hide Explanation
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Explanation
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !answer.trim()}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                                    Enter the exact output (including spaces and newlines):
                                </label>
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your predicted output here..."
                                    className="h-32 w-full rounded-lg border border-border bg-secondary p-4 font-mono text-base text-foreground placeholder:text-muted focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                                />
                            </div>

                            <div className="flex flex-col border-t border-border pt-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-sm font-medium">Result</span>
                                </div>
                                <div className="rounded-lg border border-border bg-secondary p-4">
                                    {output ? (
                                        <pre className="font-mono text-sm text-foreground">{output}</pre>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Submit your answer to see the result...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {showExplanation && problem.explanation && (
                                <div className="border-t border-border pt-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">
                                            📖 Explanation
                                        </h3>
                                    </div>
                                    <div className="rounded-lg border border-border bg-secondary p-4">
                                        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                                            {problem.explanation}
                                        </pre>
                                    </div>
                                    {!hasViewedExplanation && (
                                        <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                            <p className="text-xs font-medium text-destructive">
                                                ⚠️ Note: You viewed the explanation before submitting. You will receive 0 points even if your answer is correct.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { executeCode } from '../lib/api'
import { useProblem } from '../hooks/useProblems'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { ArrowLeft, Play, Send, Copy, Trash2, Target } from 'lucide-react'

export default function ProblemEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [code, setCode] = useState('')
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    // Load problem from database
    const { data: problem, isLoading } = useProblem(id)

    // Load saved code from localStorage
    useEffect(() => {
        if (problem) {
            const savedCode = localStorage.getItem(`problem-${id}-code`)
            if (savedCode) {
                setCode(savedCode)
            } else if (problem.starter_code_cpp) {
                setCode(problem.starter_code_cpp)
            } else {
                setCode(`#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`)
            }
        }
    }, [problem, id])

    // Auto-save code to localStorage
    useEffect(() => {
        if (code && problem) {
            localStorage.setItem(`problem-${id}-code`, code)
        }
    }, [code, id, problem])

    // Run code
    const handleRun = async () => {
        setIsRunning(true)
        setOutput('Running...')

        try {
            const result = await executeCode(code, problem?.sample_test_cases?.[0]?.input || '')

            if (result.run && result.run.output) {
                setOutput(result.run.output)
            } else if (result.run && result.run.stderr) {
                setOutput(`Error:\n${result.run.stderr}`)
            } else {
                setOutput('No output')
            }
        } catch (error) {
            setOutput(`Execution failed: ${error.message}`)
        } finally {
            setIsRunning(false)
        }
    }

    // Submit code
    const handleSubmit = async () => {
        if (!user || !problem || hasSubmitted) return

        setIsSubmitting(true)
        setOutput('Submitting...')

        try {
            // Run code with sample test case
            const result = await executeCode(code, problem.sample_test_cases?.[0]?.input || '')

            const expectedOutput = (problem.sample_test_cases?.[0]?.output || '').trim()
            const actualOutput = (result.run?.output || '').trim()
            const passed = actualOutput === expectedOutput

            // Save submission to database
            await supabase.from('submissions').insert([{
                user_id: user.id,
                problem_id: problem.id,
                code: code,
                status: passed ? 'accepted' : 'wrong_answer',
                test_cases_passed: passed ? 1 : 0,
                test_cases_total: 1,
                points_earned: passed ? (problem.points || 10) : 0,
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
                    .update({ total_score: (profile?.total_score || 0) + (problem.points || 10) })
                    .eq('id', user.id)

                setOutput(`✅ Accepted!\n\nYou earned ${problem.points || 10} points!`)
                setShowSuccess(true)
                setHasSubmitted(true)
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setOutput(`❌ Wrong Answer\n\nExpected:\n${expectedOutput}\n\nGot:\n${actualOutput}`)
            }
        } catch (error) {
            setOutput(`Submission failed: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Copy code
    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setShowCopyToast(true)
        setTimeout(() => setShowCopyToast(false), 2000)
    }

    // Clear output
    const handleClearOutput = () => {
        setOutput('')
    }

    if (!problem) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⚡</div>
                    <p className="text-muted-foreground">Loading problem...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Success Popup */}
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    className="fixed left-1/2 top-20 z-50 -translate-x-1/2 transform"
                >
                    <Card className="border-easy bg-easy/10 px-8 py-4 shadow-2xl">
                        <div className="text-center">
                            <div className="mb-2 text-4xl">🎉</div>
                            <p className="text-xl font-bold text-easy">Accepted!</p>
                            <p className="text-sm text-muted-foreground">Great work!</p>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Copy Toast */}
            {showCopyToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform"
                >
                    <Card className="border-accent-blue bg-card px-6 py-3 shadow-xl">
                        <div className="flex items-center gap-2">
                            <div className="text-accent-blue">✓</div>
                            <p className="text-sm font-medium">Code copied to clipboard</p>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/learning/${problem?.track || 'pf'}/problems`)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Problems
                </Button>

                <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                        {problem.category}
                    </div>
                    <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Target className="h-4 w-4" />
                        {problem.points || 10} points
                    </div>
                </div>
            </div>

            <div className="grid flex-1 grid-cols-2 overflow-hidden">
                {/* Left Panel - Problem Description */}
                <div className="flex flex-col overflow-hidden border-r border-border bg-muted/30">
                    <div className="border-b border-border bg-card px-6 py-4">
                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="max-w-2xl space-y-6">
                            <section>
                                <h3 className="mb-3 text-base font-semibold">Description</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
                            </section>

                            <section>
                                <h3 className="mb-3 text-base font-semibold">Input Format</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{problem.input_format}</p>
                            </section>

                            <section>
                                <h3 className="mb-3 text-base font-semibold">Output Format</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{problem.output_format}</p>
                            </section>

                            <section>
                                <h3 className="mb-3 text-base font-semibold">Sample Test Case</h3>
                                <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                                    <div>
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Input:</div>
                                        <pre className="rounded-md bg-secondary p-3 font-mono text-sm">
                                            {problem.sample_test_cases?.[0]?.input}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output:</div>
                                        <pre className="rounded-md bg-secondary p-3 font-mono text-sm">
                                            {problem.sample_test_cases?.[0]?.output}
                                        </pre>
                                    </div>
                                </div>
                            </section>

                            {problem.sample_test_cases?.[0]?.explanation && (
                                <section>
                                    <h3 className="mb-3 text-base font-semibold">Explanation</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{problem.sample_test_cases?.[0]?.explanation}</p>
                                </section>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="flex flex-col overflow-hidden">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
                        <span className="text-sm font-medium text-muted-foreground">main.cpp</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={handleCopy}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRun}
                                disabled={isRunning}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {isRunning ? 'Running...' : 'Run'}
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-accent-blue hover:bg-accent-blue/90"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </div>

                    {/* Monaco Editor - Full Height */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="cpp"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 17,
                                lineHeight: 24,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                                padding: { top: 16, bottom: 16 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontLigatures: true,
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="flex h-48 flex-col border-t border-border bg-muted/30">
                        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                            <span className="text-sm font-medium">Output</span>
                            <Button variant="ghost" size="sm" onClick={handleClearOutput}>
                                <Trash2 className="mr-2 h-3 w-3" />
                                Clear
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {output ? (
                                <pre className="font-mono text-sm leading-relaxed text-foreground">{output}</pre>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Click Run to test your code or Submit to check against all test cases
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

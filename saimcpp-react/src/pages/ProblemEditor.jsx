import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { loadAllProblems, executeCode } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { ArrowLeft, Play, Send, Copy, Trash2 } from 'lucide-react'

export default function ProblemEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [code, setCode] = useState('')
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Load all problems to find this one
    const { data: problems = [] } = useQuery({
        queryKey: ['problems'],
        queryFn: loadAllProblems,
    })

    const problem = problems.find((p) => p.id === parseInt(id))

    // Load saved code from localStorage
    useEffect(() => {
        if (problem) {
            const savedCode = localStorage.getItem(`problem-${id}-code`)
            if (savedCode) {
                setCode(savedCode)
            } else if (problem.starterCode) {
                setCode(problem.starterCode)
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
            const result = await executeCode(code, problem?.sampleInput || '')

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
        if (!user || !problem) return

        setIsSubmitting(true)
        setOutput('Submitting...')

        try {
            // Run code with sample test case
            const result = await executeCode(code, problem.sampleInput || '')

            const expectedOutput = (problem.sampleOutput || '').trim()
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
                    .select('score')
                    .eq('id', user.id)
                    .single()

                await supabase
                    .from('profiles')
                    .update({ score: (profile?.score || 0) + (problem.points || 10) })
                    .eq('id', user.id)

                setOutput(`✅ Accepted!\n\nYou earned ${problem.points || 10} points!`)
                setShowSuccess(true)
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

            <div className="grid h-full grid-cols-2">
                {/* Left Panel - Problem Description */}
                <div className="flex flex-col border-r border-border bg-card">
                    <div className="border-b border-border p-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/problems')}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Problems
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold">{problem.title}</h1>
                                <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <div>📂 {problem.category}</div>
                                <div>🎯 {problem.points || 10} points</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Description</h3>
                                <p className="text-muted-foreground">{problem.description}</p>
                            </section>

                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Input Format</h3>
                                <p className="text-muted-foreground">{problem.inputFormat}</p>
                            </section>

                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Output Format</h3>
                                <p className="text-muted-foreground">{problem.outputFormat}</p>
                            </section>

                            <section>
                                <h3 className="mb-2 text-lg font-semibold">Sample Test Case</h3>
                                <div className="space-y-3 rounded-lg bg-secondary p-4">
                                    <div>
                                        <strong className="text-sm">Input:</strong>
                                        <pre className="mt-1 rounded bg-background p-2 font-mono text-sm">
                                            {problem.sampleInput}
                                        </pre>
                                    </div>
                                    <div>
                                        <strong className="text-sm">Output:</strong>
                                        <pre className="mt-1 rounded bg-background p-2 font-mono text-sm">
                                            {problem.sampleOutput}
                                        </pre>
                                    </div>
                                </div>
                            </section>

                            {problem.explanation && (
                                <section>
                                    <h3 className="mb-2 text-lg font-semibold">Explanation</h3>
                                    <p className="text-muted-foreground">{problem.explanation}</p>
                                </section>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="flex flex-col bg-background">
                    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                        <span className="text-sm font-medium">main.cpp</span>
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
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <Editor
                            height="65%"
                            defaultLanguage="cpp"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    <div className="flex h-[35%] flex-col border-t border-border">
                        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-2">
                            <span className="text-sm font-medium">Output</span>
                            <Button variant="ghost" size="sm" onClick={handleClearOutput}>
                                <Trash2 className="mr-2 h-3 w-3" />
                                Clear
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-secondary p-4">
                            {output ? (
                                <pre className="font-mono text-sm text-foreground">{output}</pre>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Run your code to see output here...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

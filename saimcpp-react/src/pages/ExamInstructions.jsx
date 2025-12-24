import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, Clock, Shield, Ban, Eye } from 'lucide-react';

export default function ExamInstructions() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const [canStart, setCanStart] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanStart(true);
        }
    }, [countdown]);

    const handleStart = () => {
        // Request fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });

        navigate(`/mock-exam/${examId}/exam`);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-3xl"
            >
                <Card className="p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 text-6xl">📝</div>
                        <h1 className="mb-2 text-3xl font-bold">Mock Exam Instructions</h1>
                        <p className="text-muted-foreground">Read carefully before starting</p>
                    </div>

                    {/* Instructions */}
                    <div className="mb-8 space-y-6">
                        {/* Exam Details */}
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                <Clock className="h-5 w-5 text-accent-blue" />
                                Exam Details
                            </h2>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Duration: <span className="font-semibold text-foreground">3 hours (180 minutes)</span></li>
                                <li>• Total Questions: <span className="font-semibold text-foreground">10 available</span></li>
                                <li>• Choose: <span className="font-semibold text-foreground">Any 3 questions</span></li>
                                <li>• Marks: <span className="font-semibold text-foreground">25 marks each (75 total)</span></li>
                                <li>• Timer starts immediately and <span className="font-semibold text-warning">cannot be paused</span></li>
                            </ul>
                        </div>

                        {/* Anti-Cheating Rules */}
                        <div className="rounded-lg border border-warning bg-warning/10 p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-warning">
                                <Shield className="h-5 w-5" />
                                Anti-Cheating Measures (STRICTLY ENFORCED)
                            </h2>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Ban className="mt-0.5 h-4 w-4 text-warning" />
                                    <span><strong>No Tab Switching:</strong> Switching tabs will be detected. 3 violations = automatic submission</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Ban className="mt-0.5 h-4 w-4 text-warning" />
                                    <span><strong>No Copy-Paste:</strong> Copy and paste functions are disabled</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Eye className="mt-0.5 h-4 w-4 text-warning" />
                                    <span><strong>Fullscreen Required:</strong> Must stay in fullscreen mode throughout</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Ban className="mt-0.5 h-4 w-4 text-warning" />
                                    <span><strong>No Developer Tools:</strong> Opening DevTools will be flagged</span>
                                </li>
                            </ul>
                        </div>

                        {/* Important Notes */}
                        <div className="rounded-lg border border-accent-blue bg-accent-blue/10 p-4">
                            <h2 className="mb-3 text-lg font-semibold text-accent-blue">Important Notes</h2>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• You can submit individual questions as you complete them</li>
                                <li>• Code will be tested against hidden test cases</li>
                                <li>• Partial marks awarded for passing some test cases</li>
                                <li>• You can review and edit your code before final submission</li>
                                <li>• Exam auto-submits when timer reaches 0</li>
                            </ul>
                        </div>
                    </div>

                    {/* Warning Banner */}
                    <div className="mb-6 rounded-lg border-2 border-warning bg-warning/5 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-6 w-6 text-warning" />
                            <div>
                                <p className="mb-1 font-semibold text-warning">Final Warning</p>
                                <p className="text-sm text-muted-foreground">
                                    Once you start, the timer begins immediately. Any violation of anti-cheating rules
                                    will result in penalties or automatic submission. Make sure you're ready.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="text-center">
                        {!canStart ? (
                            <div>
                                <div className="mb-4 text-6xl font-bold text-accent-blue">
                                    {countdown}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Please read all instructions carefully...
                                </p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button
                                    onClick={handleStart}
                                    size="lg"
                                    className="w-full text-lg"
                                >
                                    I Understand - Start Exam
                                </Button>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    By clicking start, you agree to follow all exam rules
                                </p>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

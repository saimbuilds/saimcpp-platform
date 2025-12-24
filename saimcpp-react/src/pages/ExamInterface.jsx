import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Clock, AlertTriangle, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Send, Eye
} from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function ExamInterface() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Exam state
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState({});
    const [submissions, setSubmissions] = useState({});

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(180 * 60); // 3 hours in seconds
    const [attemptId, setAttemptId] = useState(null);

    // Anti-cheating state
    const [violations, setViolations] = useState({
        tabSwitch: 0,
        copyPaste: 0,
        fullscreen: 0,
        devTools: 0
    });
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showAutoSubmit, setShowAutoSubmit] = useState(false);
    const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(10);

    // Load exam and questions
    useEffect(() => {
        loadExam();
        createAttempt();
        setupAntiCheating();

        return () => cleanupAntiCheating();
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining <= 0) {
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Auto-submit countdown
    useEffect(() => {
        if (showAutoSubmit && autoSubmitCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoSubmitCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showAutoSubmit && autoSubmitCountdown === 0) {
            handleAutoSubmit();
        }
    }, [showAutoSubmit, autoSubmitCountdown]);

    async function loadExam() {
        // Load exam details
        const { data: examData } = await supabase
            .from('mock_exams')
            .select('*')
            .eq('id', examId)
            .single();

        setExam(examData);

        // Load questions and RANDOMIZE
        const { data: questionsData } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', examId)
            .order('question_number');

        // Shuffle questions randomly
        const shuffled = questionsData?.sort(() => Math.random() - 0.5) || [];
        setQuestions(shuffled);

        // Initialize code for all questions
        const initialCode = {};
        shuffled.forEach(q => {
            initialCode[q.id] = q.starter_code || '';
        });
        setCode(initialCode);
    }

    async function createAttempt() {
        const { data, error } = await supabase
            .from('exam_attempts')
            .insert({
                user_id: user.id,
                exam_id: examId,
                status: 'in-progress'
            })
            .select()
            .single();

        if (!error) {
            setAttemptId(data.id);
        }
    }

    function setupAntiCheating() {
        // Tab switch detection (visibilitychange)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Window blur/focus detection (catches Alt+Tab, Windows key, etc.)
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        // Copy-paste prevention
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);

        // Right-click disable
        document.addEventListener('contextmenu', preventContextMenu);

        // Screenshot prevention (PrintScreen, Cmd+Shift+3/4/5)
        document.addEventListener('keydown', preventScreenshot);

        // Fullscreen exit detection
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // DevTools detection (basic)
        const detectDevTools = setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 ||
                window.outerWidth - window.innerWidth > 200) {
                recordViolation('devTools', 'Developer tools detected');
            }
        }, 1000);

        return () => clearInterval(detectDevTools);
    }

    function cleanupAntiCheating() {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventScreenshot);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            recordViolation('tabSwitch', 'Tab switching detected!');
        }
    }

    function handleWindowBlur() {
        // Window lost focus (Alt+Tab, clicking outside, etc.)
        recordViolation('tabSwitch', 'Window switching detected! Stay focused on the exam.');
    }

    function handleWindowFocus() {
        // Window regained focus - could show a reminder
        console.log('Window focused again');
    }

    function preventCopyPaste(e) {
        e.preventDefault();
        recordViolation('copyPaste', 'Copy/paste is disabled!');
    }

    function preventContextMenu(e) {
        e.preventDefault();
    }

    function preventScreenshot(e) {
        // Prevent PrintScreen, Cmd+Shift+3/4/5 (Mac), Win+PrintScreen
        if (e.key === 'PrintScreen' ||
            (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
            (e.key === 'PrintScreen' && e.metaKey)) {
            e.preventDefault();
            recordViolation('copyPaste', 'Screenshots are not allowed!');
        }

        // Detect Alt+Tab (Windows/Linux)
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            recordViolation('tabSwitch', 'Alt+Tab detected! Stay on the exam tab.');
        }

        // Detect Windows key combinations
        if (e.key === 'Meta' || e.metaKey) {
            // Windows key pressed or in combination
            if (e.key === 'Meta' ||
                e.key === 'd' || // Windows+D (Show Desktop)
                e.key === 'Tab' || // Windows+Tab (Task View)
                ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { // Windows+Arrows (Snap)
                e.preventDefault();
                recordViolation('tabSwitch', 'Windows key shortcuts are not allowed!');
            }
        }

        // Detect Cmd+Tab (Mac)
        if (e.metaKey && e.key === 'Tab') {
            e.preventDefault();
            recordViolation('tabSwitch', 'Cmd+Tab detected! Stay on the exam tab.');
        }

        // Detect Ctrl+Tab (Browser tab switching)
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            recordViolation('tabSwitch', 'Tab switching is not allowed!');
        }
    }

    function handleFullscreenChange() {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);

        if (!isNowFullscreen) {
            recordViolation('fullscreen', 'Please stay in fullscreen mode!');
        }
    }

    function enterFullscreen() {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    }

    function recordViolation(type, message) {
        setViolations(prev => {
            const newViolations = { ...prev, [type]: prev[type] + 1 };

            // Show warning
            setWarningMessage(message);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);

            // Auto-submit after 3 violations
            const totalViolations = Object.values(newViolations).reduce((a, b) => a + b, 0);
            if (totalViolations >= 3) {
                setShowAutoSubmit(true);
                setAutoSubmitCountdown(10); // Reset countdown
            }

            return newViolations;
        });
    }

    function toggleQuestionSelection(questionId) {
        setSelectedQuestions(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(id => id !== questionId);
            } else if (prev.length < 3) {
                return [...prev, questionId];
            }
            return prev;
        });
    }

    async function submitQuestion(questionId) {
        console.log('Submit clicked:', { questionId, attemptId, hasCode: !!code[questionId] });

        if (!questionId) {
            console.error('No questionId provided');
            return;
        }

        if (!attemptId) {
            console.error('No attemptId - exam not started properly');
            return;
        }

        const codeToSubmit = code[questionId] || '';
        console.log('Submitting code:', codeToSubmit.substring(0, 100));

        const { data, error } = await supabase
            .from('exam_submissions')
            .upsert({
                attempt_id: attemptId,
                question_id: questionId,
                code: codeToSubmit,
                score: 0
            }, {
                onConflict: 'attempt_id,question_id'
            })
            .select();

        if (error) {
            console.error('Submission error:', error);
            alert('Failed to submit: ' + error.message);
            return;
        }

        console.log('Submission successful:', data);
        setSubmissions(prev => {
            const newSubmissions = { ...prev, [questionId]: true };

            // Auto-end exam if all 3 questions submitted
            if (selectedQuestions.every(qId => newSubmissions[qId])) {
                setTimeout(() => {
                    handleFinishExam();
                }, 1000);
            }

            return newSubmissions;
        });
    }

    async function handleAutoSubmit() {
        // Submit all selected questions
        for (const qId of selectedQuestions) {
            await submitQuestion(qId);
        }

        // Update attempt
        await supabase
            .from('exam_attempts')
            .update({
                submitted_at: new Date().toISOString(),
                time_taken_minutes: Math.floor((180 * 60 - timeRemaining) / 60),
                violations: violations,
                status: 'auto-submitted'
            })
            .eq('id', attemptId);

        navigate('/mock-exams');
    }

    function confirmEndExam() {
        setShowEndConfirm(true);
    }

    async function handleFinishExam() {
        setShowEndConfirm(false);

        // Submit all selected questions that haven't been submitted
        for (const qId of selectedQuestions) {
            if (!submissions[qId]) {
                await submitQuestion(qId);
            }
        }

        // Update attempt
        await supabase
            .from('exam_attempts')
            .update({
                submitted_at: new Date().toISOString(),
                time_taken_minutes: Math.floor((180 * 60 - timeRemaining) / 60),
                violations: violations,
                status: 'submitted'
            })
            .eq('id', attemptId);

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        navigate('/mock-exams');
    }

    // Format time
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = selectedQuestions[currentQuestionIndex]
        ? questions.find(q => q.id === selectedQuestions[currentQuestionIndex])
        : null;

    if (!exam || questions.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⏳</div>
                    <p className="text-muted-foreground">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Question selection screen
    if (selectedQuestions.length < 3) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{exam.title}</h1>
                            <p className="text-muted-foreground">Select any 3 questions to attempt</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-accent-blue/10 px-4 py-2 text-accent-blue">
                                <Clock className="mr-2 inline h-5 w-5" />
                                <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {questions.map((question, index) => (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card
                                    className={`cursor-pointer p-6 transition-all ${selectedQuestions.includes(question.id)
                                        ? 'border-accent-blue bg-accent-blue/5'
                                        : 'hover:border-border hover:shadow-md'
                                        }`}
                                    onClick={() => toggleQuestionSelection(question.id)}
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Question {question.question_number}</span>
                                            <h3 className="text-lg font-semibold">{question.title}</h3>
                                        </div>
                                        {selectedQuestions.includes(question.id) && (
                                            <CheckCircle className="h-6 w-6 text-accent-blue" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{question.category}</span>
                                        <span>•</span>
                                        <span>{question.marks} marks</span>
                                        <span>•</span>
                                        <span>~{question.time_estimate_minutes} min</span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Start Button */}
                    {selectedQuestions.length === 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 text-center"
                        >
                            <Button
                                size="lg"
                                onClick={() => setCurrentQuestionIndex(0)}
                                className="w-full max-w-md"
                            >
                                Start Solving ({selectedQuestions.length}/3 selected)
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // Exam interface
    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Warning Overlay with Blur */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md"
                        >
                            <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
                                {/* Header */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                                        <AlertTriangle className="h-5 w-5 text-warning" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Violation Detected</h3>
                                </div>

                                {/* Message */}
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {warningMessage}
                                </p>

                                {/* Violation Counter */}
                                <div className="mb-4 rounded-md bg-muted p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Violations</span>
                                        <span className="text-2xl font-bold">
                                            {Object.values(violations).reduce((a, b) => a + b, 0)}/3
                                        </span>
                                    </div>
                                </div>

                                {/* Final Warning */}
                                {Object.values(violations).reduce((a, b) => a + b, 0) >= 2 && (
                                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                                        <p className="text-sm font-medium text-destructive">
                                            ⚠️ Final Warning: One more violation will auto-submit your exam
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* End Exam Confirmation Modal */}
            <AnimatePresence>
                {showEndConfirm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/50"
                            onClick={() => setShowEndConfirm(false)}
                        />

                        {/* Confirmation Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
                                <h3 className="mb-4 text-2xl font-bold">End Exam?</h3>
                                <p className="mb-6 text-muted-foreground">
                                    Are you sure you want to end the exam?
                                    {selectedQuestions.some(qId => !submissions[qId]) && (
                                        <span className="mt-2 block font-semibold text-warning">
                                            ⚠️ You have unsubmitted questions!
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowEndConfirm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleFinishExam}
                                        className="flex-1 bg-warning hover:bg-warning/90"
                                    >
                                        Yes, End Exam
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Auto-Submit Modal - Shows when 3 violations reached */}
            <AnimatePresence>
                {showAutoSubmit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-full max-w-lg"
                        >
                            <div className="rounded-lg border-2 border-warning bg-card p-8 shadow-2xl">
                                <div className="mb-6 text-center">
                                    <div className="mb-4 text-6xl">⚠️</div>
                                    <h2 className="mb-2 text-3xl font-bold text-warning">Exam Auto-Submitted!</h2>
                                    <p className="text-lg text-muted-foreground">
                                        Your exam has been automatically submitted due to multiple violations.
                                    </p>

                                    {/* Roasting Message */}
                                    <div className="mt-4 rounded-lg bg-muted p-4">
                                        <p className="text-base font-semibold italic text-foreground">
                                            "Instructions sahi se parhne thay... 🤦‍♂️"
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Maybe next time read the anti-cheating rules properly? 😅
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6 rounded-lg bg-warning/10 p-4">
                                    <h3 className="mb-3 font-semibold text-warning">Violations Detected:</h3>
                                    <div className="space-y-2 text-sm">
                                        {violations.tabSwitch > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span>Tab Switching:</span>
                                                <span className="font-bold">{violations.tabSwitch}</span>
                                            </div>
                                        )}
                                        {violations.copyPaste > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span>Copy/Paste/Screenshot:</span>
                                                <span className="font-bold">{violations.copyPaste}</span>
                                            </div>
                                        )}
                                        {violations.fullscreen > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span>Fullscreen Exit:</span>
                                                <span className="font-bold">{violations.fullscreen}</span>
                                            </div>
                                        )}
                                        {violations.devTools > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span>DevTools:</span>
                                                <span className="font-bold">{violations.devTools}</span>
                                            </div>
                                        )}
                                        <div className="mt-3 border-t border-warning/30 pt-3">
                                            <div className="flex items-center justify-between text-base font-bold text-warning">
                                                <span>Total:</span>
                                                <span>{Object.values(violations).reduce((a, b) => a + b, 0)}/3</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="mb-2 text-5xl font-bold text-warning">{autoSubmitCountdown}</div>
                                    <p className="text-sm text-muted-foreground">
                                        Redirecting to exam list...
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        Question {currentQuestionIndex + 1} of {selectedQuestions.length}
                    </h2>
                    <span className="text-sm text-muted-foreground">{currentQuestion?.title}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`rounded-lg px-4 py-2 ${timeRemaining < 600 ? 'bg-warning/10 text-warning' : 'bg-accent-blue/10 text-accent-blue'
                        }`}>
                        <Clock className="mr-2 inline h-5 w-5" />
                        <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
                    </div>

                    {/* End Exam Button - Always visible */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={confirmEndExam}
                        className="border-warning text-warning hover:bg-warning/10 hover:border-warning/80 transition-all"
                    >
                        End Exam
                    </Button>
                </div>
            </div>

            {/* Fullscreen Re-entry Banner */}
            <AnimatePresence>
                {!isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed left-0 right-0 top-16 z-40 bg-accent-blue p-4 text-center text-white"
                    >
                        <div className="flex items-center justify-center gap-4">
                            <Eye className="h-5 w-5" />
                            <span className="font-semibold">You exited fullscreen mode</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={enterFullscreen}
                                className="border-white bg-white text-accent-blue hover:bg-gray-100"
                            >
                                Re-enter Fullscreen
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Panel */}
                <div className="w-1/2 overflow-y-auto border-r border-border p-6">
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                table: ({ node, ...props }) => (
                                    <table className="border-collapse border border-gray-600" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                    <td className="border border-gray-600 p-2 text-center" {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                    <th className="border border-gray-600 bg-gray-800 p-2" {...props} />
                                ),
                            }}
                        >
                            {currentQuestion?.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Code Editor Panel */}
                <div className="flex w-1/2 flex-col">
                    <div className="relative flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="cpp"
                            theme="vs-dark"
                            value={code[currentQuestion?.id] || ''}
                            onChange={(value) => setCode(prev => ({ ...prev, [currentQuestion?.id]: value }))}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                readOnly: submissions[currentQuestion?.id] // Lock after submission
                            }}
                        />

                        {/* Locked Overlay */}
                        {submissions[currentQuestion?.id] && (
                            <div className="absolute right-4 top-4 rounded-lg border border-accent-green bg-accent-green/10 px-3 py-1.5 text-sm font-semibold text-accent-green">
                                <CheckCircle className="mr-1.5 inline h-4 w-4" />
                                Submitted & Locked
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between border-t border-border bg-card p-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(selectedQuestions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === selectedQuestions.length - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={() => submitQuestion(currentQuestion?.id)}
                            disabled={submissions[currentQuestion?.id]}
                        >
                            {submissions[currentQuestion?.id] ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Submitted
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Question
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

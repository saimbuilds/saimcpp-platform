import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { executeCode } from '../lib/api';

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
    const [submitting, setSubmitting] = useState(false);
    const [codeOutput, setCodeOutput] = useState({});  // Store output for each question

    // Auto-selection state
    const [isSelectingQuestions, setIsSelectingQuestions] = useState(true);
    const [selectionProgress, setSelectionProgress] = useState(0);

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
    const [autoSubmitReason, setAutoSubmitReason] = useState(null); // 'time' or 'violation'
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [questionToSubmit, setQuestionToSubmit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Flag to ignore fullscreen during submission

    // Toast notification state
    const [toast, setToast] = useState(null);

    // UI state
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);

    const [showAllSubmittedConfirm, setShowAllSubmittedConfirm] = useState(false);

    // New UX states
    const [isEndingExam, setIsEndingExam] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Load exam and questions
    const attemptCreatedRef = useRef(false);

    useEffect(() => {
        loadExam();
        createAttempt();
    }, []);

    // Timer countdown
    useEffect(() => {
        // Stop timer if exam is ending
        if (isEndingExam) return;

        if (timeRemaining <= 0) {
            setAutoSubmitReason('time');
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, isEndingExam]);

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

    // Helper: Fisher-Yates shuffle for random selection
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Helper: Get previously selected question IDs from localStorage
    function getPreviouslySelected() {
        try {
            const historyKey = `pf_lab_exam_history_${user?.id || 'guest'}`;
            const history = localStorage.getItem(historyKey);
            if (!history) return [];

            const parsed = JSON.parse(history);
            // Return question IDs from last 7 attempts (21 questions total)
            return parsed.slice(-7).flatMap(attempt => attempt.question_ids);
        } catch (error) {
            console.error('Error reading exam history:', error);
            return [];
        }
    }

    // Helper: Save selected questions to localStorage
    function saveSelectedQuestions(questionIds) {
        try {
            const historyKey = `pf_lab_exam_history_${user?.id || 'guest'}`;
            const history = localStorage.getItem(historyKey);
            const parsed = history ? JSON.parse(history) : [];

            // Add new attempt
            parsed.push({
                timestamp: new Date().toISOString(),
                question_ids: questionIds
            });

            // Keep only last 10 attempts
            const trimmed = parsed.slice(-10);
            localStorage.setItem(historyKey, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Error saving exam history:', error);
        }
    }

    // Smart random selection: Select N questions avoiding recently used ones
    function selectRandomQuestions(allQuestions, count) {
        const previouslySelected = getPreviouslySelected();

        // Filter out recently used questions
        let availableQuestions = allQuestions.filter(
            q => !previouslySelected.includes(q.id)
        );

        // If pool is too small, reset and use all questions
        if (availableQuestions.length < count) {
            console.log('Question pool exhausted, resetting history');
            availableQuestions = allQuestions;
        }

        // Shuffle and select
        const shuffled = shuffleArray(availableQuestions);
        const selected = shuffled.slice(0, count);
        const selectedIds = selected.map(q => q.id);

        // Save to localStorage
        saveSelectedQuestions(selectedIds);

        return selectedIds;
    }

    async function loadExam() {
        // Load exam details  
        const { data: examData } = await supabase
            .from('mock_exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examData) {
            setExam(examData);
            setTimeRemaining(examData.duration_minutes * 60);
        }

        // Load questions
        const { data: questionsData } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', examId)
            .order('question_number');

        const allQuestions = questionsData || [];
        setQuestions(allQuestions);

        // Select ALL question IDs
        const allIds = allQuestions.map(q => q.id);
        setSelectedQuestions(allIds);

        // Initialize code
        const initialCode = {};
        allQuestions.forEach(q => {
            const rawCode = q.starter_code || '';
            initialCode[q.id] = rawCode.replace(/\\n/g, '\n');
        });
        setCode(initialCode);

        // Hide loading screen and start exam
        setIsSelectingQuestions(false);
        setupAntiCheating();
    }

    // Auto-selection removed - showing all questions
    useEffect(() => {
        // No-op
    }, []);

    async function createAttempt() {
        try {
            // Validate user and examId
            if (!user || !user.id) {
                console.error('User not authenticated:', user);
                alert('You must be logged in to start the exam. Please sign in and try again.');
                navigate('/login');
                return;
            }

            if (!examId) {
                console.error('Exam ID is missing');
                alert('Invalid exam. Please go back and select an exam.');
                navigate('/mock-exams');
                return;
            }

            console.log('Creating attempt for user:', user.id, 'exam:', examId);

            // Use upsert to handle existing attempts - will update if exists, insert if not
            const { data, error } = await supabase
                .from('exam_attempts')
                .upsert({
                    user_id: user.id,
                    exam_id: examId,
                    status: 'in-progress',
                    started_at: new Date().toISOString(),
                    submitted_at: null,
                    time_taken_minutes: null,
                    score: 0
                }, {
                    onConflict: 'user_id,exam_id'
                })
                .select()
                .single();

            if (error) {
                console.error('Failed to create attempt:', error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                alert(`Failed to start exam: ${error.message}\n\nPlease refresh the page and try again.`);
                return;
            }

            console.log('✅ Exam attempt created successfully:', data.id);
            setAttemptId(data.id);
        } catch (err) {
            console.error('Error creating attempt:', err);
            alert(`Failed to start exam: ${err.message}\n\nPlease refresh the page and try again.`);
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

    // Helper function to show toast notifications (prevents fullscreen exit from alerts)
    function showToast(message, type = 'info', duration = 3000) {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }

    // Disable anti-cheating when exam ends to prevent violations
    function disableAntiCheating() {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('paste', preventCopyPaste);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
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

        // Don't record violation if:
        // 1. We're in the middle of submitting (modals can cause fullscreen exit)
        // 2. Any modal is currently open
        const isModalOpen = showSubmitConfirm || showEndConfirm || showAutoSubmit || showAllSubmittedConfirm;

        if (!isNowFullscreen && !isSubmitting && !isModalOpen) {
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
                setAutoSubmitReason('violation');
                setShowAutoSubmit(true);
                setAutoSubmitCountdown(10); // Reset countdown
            }

            return newViolations;
        });
    }

    function toggleQuestionSelection(questionId) {
        // In full mode, we don't toggle selection, we just navigate
        const index = selectedQuestions.indexOf(questionId);
        if (index !== -1) {
            setCurrentQuestionIndex(index);
        }
    }

    function requestSubmitQuestion(questionId, event) {
        // Prevent any default behavior that might cause fullscreen exit
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Set flag to ignore fullscreen changes during submission
        setIsSubmitting(true);
        setQuestionToSubmit(questionId);
        setShowSubmitConfirm(true);
    }

    async function confirmSubmitQuestion() {
        setShowSubmitConfirm(false);
        if (questionToSubmit) {
            await submitQuestion(questionToSubmit);
            setQuestionToSubmit(null);
        }
        // Reset flag after submission complete - increased to 3 seconds to cover modal closing
        setTimeout(() => setIsSubmitting(false), 3000);
    }

    async function submitQuestion(questionId, silent = false) {
        setSubmitting(true);

        try {
            console.log('Submit clicked:', { questionId, attemptId, hasCode: !!code[questionId] });

            // Validation
            if (!questionId) {
                throw new Error('No question selected');
            }

            if (!attemptId) {
                throw new Error('Exam not started properly. Please refresh and try again.');
            }

            const codeToSubmit = code[questionId] || '';

            if (!codeToSubmit.trim()) {
                showToast('⚠️ Submitting empty code. Make sure this is intentional!', 'info');
                // Continue with submission
            }

            console.log('Submitting code:', codeToSubmit.substring(0, 100));

            // Insert submission (not upsert to avoid conflicts)
            const { data, error } = await supabase
                .from('exam_submissions')
                .insert({
                    attempt_id: attemptId,
                    question_id: questionId,
                    code: codeToSubmit,
                    score: 0
                })
                .select();

            if (error) {
                // If duplicate, try update instead
                if (error.code === '23505') {
                    const { data: updateData, error: updateError } = await supabase
                        .from('exam_submissions')
                        .update({ code: codeToSubmit })
                        .eq('attempt_id', attemptId)
                        .eq('question_id', questionId)
                        .select();

                    if (updateError) throw updateError;
                    console.log('Submission updated:', updateData);
                } else {
                    throw error;
                }
            } else {
                console.log('Submission successful:', data);
            }

            // Update local state
            setSubmissions(prev => {
                const newSubmissions = { ...prev, [questionId]: true };


                // Check if all questions are submitted after state update
                setTimeout(() => {
                    const allSubmitted = selectedQuestions.every(qId =>
                        qId === questionId || submissions[qId]
                    );

                    if (allSubmitted) {
                        // Show custom modal instead of window.confirm
                        setShowAllSubmittedConfirm(true);
                    }
                }, 500);


                return newSubmissions;
            });

            // Success feedback
            if (!silent) {
                showToast('✅ Question submitted successfully!', 'success');
            }

        } catch (error) {
            console.error('Submission error:', error);
            showToast('❌ Failed to submit: ' + error.message, 'error', 5000);
        } finally {
            setSubmitting(false);
        }
    }

    async function runCode(questionId) {
        const userCode = code[questionId] || '';

        console.log('🚀 Running code for question:', questionId);
        console.log('📝 Code length:', userCode.length);

        if (!userCode.trim()) {
            const errorMsg = 'Error: No code to run. Please write some code first.';
            console.log('❌', errorMsg);
            setCodeOutput(prev => ({
                ...prev,
                [questionId]: errorMsg
            }));
            return;
        }

        // Show running status
        console.log('⏳ Setting running status...');
        setCodeOutput(prev => {
            const newOutput = {
                ...prev,
                [questionId]: '⏳ Running your code...'
            };
            console.log('📊 New output state:', newOutput);
            return newOutput;
        });

        try {
            // Get the current question to access test cases
            const question = questions.find(q => q.id === questionId);
            const sampleInput = question?.visible_test_cases?.[0]?.input || '';

            // Execute code using Piston API
            const result = await executeCode(userCode, sampleInput);

            // Format output
            let output = '';

            if (result.run && result.run.output) {
                output = `✅ Code executed successfully!\n\n`;
                output += `Output:\n${result.run.output}\n`;

                // Show expected output if available
                if (question?.visible_test_cases?.[0]?.output) {
                    const expected = question.visible_test_cases[0].output
                        .replace(/\\r\\n/g, '\n')
                        .replace(/\\\\n/g, '\n')
                        .replace(/\\n/g, '\n');
                    output += `\nExpected Output:\n${expected}`;
                }
            } else if (result.run && result.run.stderr) {
                output = `❌ Compilation/Runtime Error:\n\n${result.run.stderr}`;
            } else if (result.compile && result.compile.stderr) {
                output = `❌ Compilation Error:\n\n${result.compile.stderr}`;
            } else {
                output = '⚠️ No output generated.';
            }

            console.log('✅ Setting final output:', output.substring(0, 100));
            setCodeOutput(prev => {
                const newOutput = {
                    ...prev,
                    [questionId]: output
                };
                console.log('📊 Final output state:', newOutput);
                return newOutput;
            });
        } catch (error) {
            const errorMsg = `❌ Execution failed: ${error.message}\n\nPlease check your code and try again.`;
            console.log('❌ Error:', errorMsg);
            setCodeOutput(prev => ({
                ...prev,
                [questionId]: errorMsg
            }));
        }
    }

    async function handleAutoSubmit() {
        // Submit all selected questions in PARALLEL
        const submissionPromises = selectedQuestions.map(qId => submitQuestion(qId));
        await Promise.all(submissionPromises);

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

        navigate('/learning');
    }

    function confirmEndExam() {
        setShowEndConfirm(true);
    }

    async function handleFinishExam() {
        try {
            setShowEndConfirm(false);
            setIsEndingExam(true);

            // Disable anti-cheating FIRST to prevent violations during exam end
            disableAntiCheating();

            // Submit all selected questions that haven't been submitted (IN PARALLEL)
            const submissionPromises = selectedQuestions
                .filter(qId => !submissions[qId])
                .map(qId => submitQuestion(qId, true));

            await Promise.all(submissionPromises);

            // Update attempt status to submitted
            const { error: updateError } = await supabase
                .from('exam_attempts')
                .update({
                    submitted_at: new Date().toISOString(),
                    time_taken_minutes: Math.floor((180 * 60 - timeRemaining) / 60),
                    violations: violations,
                    status: 'submitted'
                })
                .eq('id', attemptId);

            if (updateError) {
                console.error('Error updating attempt:', updateError);
            }

            // ✅ REMOVED SLOW GRADING - Was taking 20+ seconds with 21 API calls
            // Grading can happen later as background job or on-demand
            console.log('✅ Exam submitted successfully! Grading will happen in background.');

            // Exit fullscreen
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(err => console.log('Fullscreen exit error:', err));
            }

            // Show Success Modal
            setIsEndingExam(false);
            setShowSuccessModal(true);

        } catch (err) {
            console.error('Error ending exam:', err);
            // Fallback
            setIsEndingExam(false);
            alert('Partial error ending exam. Redirecting to Learning Hub.');
            navigate('/learning');
        }
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

    // Auto-selection loader screen
    if (isSelectingQuestions) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md px-8"
                >
                    <motion.div
                        className="mb-6 text-7xl hidden"
                        animate={{
                            rotate: [0, 10, -10, 10, 0],
                            scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        🎯
                    </motion.div>

                    {/* Icon - Document/Exam icon */}
                    <motion.div
                        className="mb-8 flex justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 shadow-2xl">
                            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </motion.div>
                    <h2 className="mb-3 text-center text-2xl font-semibold tracking-tight text-white">
                        Preparing Your Exam
                    </h2>
                    <p className="mb-8 text-center text-sm text-gray-400">
                        Carefully selecting questions for you...
                    </p>

                    {/* Premium Progress Bar */}
                    <div className="relative">
                        {/* Background track */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800/50 backdrop-blur-sm">
                            {/* Animated gradient progress */}
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-[length:200%_100%]"
                                initial={{ width: '0%' }}
                                animate={{
                                    width: `${selectionProgress}%`,
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{
                                    width: { duration: 0.3, ease: 'easeOut' },
                                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
                                }}
                            />
                        </div>

                        {/* Glow effect */}
                        <motion.div
                            className="absolute inset-0 -z-10 h-1.5 rounded-full bg-purple-600/20 blur-md"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>

                    {/* Percentage */}
                    <motion.div
                        className="mt-4 text-center text-sm font-medium text-gray-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {Math.round(selectionProgress)}%
                    </motion.div>
                    <div className="mt-6 flex justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="h-3 w-3 rounded-full bg-accent-blue"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Exam interface
    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-4 shadow-2xl ${toast.type === 'success' ? 'bg-green-600' :
                            toast.type === 'error' ? 'bg-red-600' :
                                'bg-blue-600'
                            } text-white font-semibold`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Ending Exam Loader Overlay */}
            <AnimatePresence>
                {isEndingExam && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="mb-6 h-16 w-16 rounded-full border-4 border-gray-700 border-t-purple-500"
                        />
                        <h2 className="text-2xl font-bold text-white mb-2">Submitting Exam...</h2>
                        <p className="text-gray-400">Wrapping up your answers. Please wait.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-sm bg-[#0a0a0f] border border-gray-800 p-8 rounded-lg shadow-2xl text-center">
                            <h2 className="text-xl font-medium text-white mb-2">Exam Completed</h2>
                            <p className="text-gray-400 text-sm mb-8">Your answers have been securely recorded.</p>

                            <Button
                                onClick={() => navigate('/learning')}
                                className="w-full bg-white text-black hover:bg-gray-200 font-medium py-2 rounded-md transition-colors"
                            >
                                Return to Learning Hub
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Warning Overlay with Blur - Purple Theme */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                        onClick={() => setShowWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20"
                        >
                            <div className="mb-6 flex items-center justify-center">
                                <div className="p-4 bg-purple-500/20 rounded-full">
                                    <AlertTriangle className="h-12 w-12 text-purple-400" />
                                </div>
                            </div>

                            <h2 className="mb-4 text-center text-2xl font-bold text-white">Policy Violation Detected</h2>
                            <p className="mb-6 text-center text-gray-300">{warningMessage}</p>

                            <div className="mb-6 space-y-3">
                                {/* Violation Stats - Purple Theme */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-400">{violations.tabSwitch || 0}</div>
                                        <div className="text-xs text-purple-300">Tab Switch</div>
                                    </div>
                                    <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-400">{violations.blur || 0}</div>
                                        <div className="text-xs text-purple-300">Focus Lost</div>
                                    </div>
                                    <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-400">{violations.other || 0}</div>
                                        <div className="text-xs text-purple-300">Other</div>
                                    </div>
                                </div>

                                {/* Total with purple accent */}
                                <div className="rounded-lg bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 p-4 text-center">
                                    <span className="text-sm text-purple-200">Total Violations:</span>
                                    <span className="ml-2 text-2xl font-bold text-white">
                                        {Object.values(violations).reduce((a, b) => a + b, 0)}/3
                                    </span>
                                </div>

                                {/* Final Warning */}
                                {Object.values(violations).reduce((a, b) => a + b, 0) >= 2 && (
                                    <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3">
                                        <p className="text-sm font-medium text-red-400">
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

            {/* Submit Question Confirmation Modal */}
            <AnimatePresence>
                {showSubmitConfirm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/50"
                            onClick={() => setShowSubmitConfirm(false)}
                        />

                        {/* Confirmation Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
                                <h3 className="mb-4 text-2xl font-bold">Submit Question?</h3>
                                <p className="mb-6 text-muted-foreground">
                                    Are you sure you want to submit this question?
                                    <span className="mt-2 block font-semibold text-warning">
                                        ⚠️ You cannot change your answer after submission!
                                    </span>
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSubmitConfirm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={confirmSubmitQuestion}
                                        className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
                                    >
                                        Yes, Submit
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* All Questions Submitted Confirmation Modal */}
            <AnimatePresence>
                {showAllSubmittedConfirm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/50"
                            onClick={() => setShowAllSubmittedConfirm(false)}
                        />

                        {/* Confirmation Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-md rounded-lg border border-accent-green bg-card p-8 shadow-2xl">
                                <div className="mb-6 text-center text-6xl">🎉</div>
                                <h3 className="mb-4 text-2xl font-bold text-center">All Questions Submitted!</h3>
                                <p className="mb-6 text-center text-muted-foreground">
                                    Great job! All questions have been submitted.
                                </p>
                                <Button
                                    onClick={() => {
                                        setShowAllSubmittedConfirm(false);
                                        handleFinishExam();
                                    }}
                                    className="w-full bg-accent-green hover:bg-accent-green/90"
                                >
                                    End Exam
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Auto-Submit Modal - Minimalist */}
            <AnimatePresence>
                {showAutoSubmit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    >
                        <div className="w-full max-w-sm bg-[#0a0a0f] border border-gray-800 p-8 rounded-lg shadow-2xl text-center">
                            {autoSubmitReason === 'violation' ? (
                                <>
                                    <h2 className="text-xl font-medium text-white mb-2">Violations Limit Reached</h2>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Your exam has been automatically submitted due to repeated policy violations.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-medium text-white mb-2">Time Expired</h2>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Your exam has been automatically submitted due to time limits.
                                    </p>
                                </>
                            )}

                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-2">Redirecting in</p>
                                <div className="text-2xl font-bold text-white mb-1">{autoSubmitCountdown}</div>
                            </div>
                        </div>
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
                {/* Question Panel - Conditional */}
                {showQuestionPanel && (
                    <div className="w-1/2 overflow-y-auto border-r border-border p-10 bg-gray-950">
                        <div className="prose prose-invert max-w-none 
                        prose-headings:text-accent-blue prose-headings:font-bold prose-headings:mb-10 prose-headings:mt-12 prose-headings:leading-tight
                        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                        prose-p:text-lg prose-p:leading-loose prose-p:mb-8 prose-p:text-gray-200
                        prose-strong:text-accent-green prose-strong:font-bold prose-strong:text-xl
                        prose-ul:my-10 prose-ul:space-y-4 prose-ul:text-gray-200 prose-ul:leading-loose prose-ul:text-lg
                        prose-ol:my-10 prose-ol:space-y-4 prose-ol:text-gray-200 prose-ol:leading-loose prose-ol:text-lg
                        prose-li:text-lg prose-li:leading-loose prose-li:mb-3
                        prose-code:bg-gray-800 prose-code:text-accent-green prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base prose-code:font-semibold
                        prose-pre:bg-gray-900 prose-pre:p-8 prose-pre:rounded-xl prose-pre:my-10 prose-pre:border-2 prose-pre:border-gray-700 prose-pre:leading-relaxed
                        prose-blockquote:border-l-4 prose-blockquote:border-accent-blue prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-lg prose-blockquote:my-8">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    fontSize: '17px',
                                                    padding: '2rem',
                                                    borderRadius: '0.75rem',
                                                    margin: '2rem 0',
                                                    lineHeight: '1.8'
                                                }}
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
                                    p: ({ node, children, ...props }) => (
                                        <p className="text-lg leading-loose mb-8 text-gray-200" {...props}>
                                            {children}
                                        </p>
                                    ),
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-8">
                                            <table className="border-collapse border-2 border-blue-500/30 w-auto mx-auto bg-blue-950/30 shadow-lg shadow-blue-500/10 rounded-lg overflow-hidden" {...props} />
                                        </div>
                                    ),
                                    tr: ({ node, ...props }) => (
                                        <tr className="border-b border-blue-500/20" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="border border-blue-500/30 bg-blue-900/40 p-4 text-center text-lg font-medium text-white min-w-[80px] min-h-[60px]" {...props} />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="border border-blue-500/30 bg-blue-600/30 p-4 text-center font-bold text-blue-300 text-lg uppercase tracking-wide" {...props} />
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead className="bg-blue-800/20" {...props} />
                                    ),
                                    tbody: ({ node, ...props }) => (
                                        <tbody className="bg-blue-950/20" {...props} />
                                    ),
                                }}
                            >
                                {(() => {
                                    const content = currentQuestion?.content || '';
                                    // Replace \n escape sequences with actual newlines
                                    const processed = content.replace(/\\n/g, '\n');

                                    return processed;
                                })()}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Code Editor Panel */}
                <div className={`flex flex-col ${showQuestionPanel ? 'w-1/2' : 'w-full'} overflow-hidden`}>
                    <div className="relative flex-1 min-h-0">
                        <Editor
                            height="100%"
                            defaultLanguage="cpp"
                            theme="vs-dark"
                            value={code[currentQuestion?.id] || ''}
                            onChange={(value) => setCode(prev => ({ ...prev, [currentQuestion?.id]: value }))}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 18,
                                lineHeight: 28,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 },
                                stickyScroll: { enabled: false },
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

                    {/* Code Output Section */}
                    {codeOutput[currentQuestion?.id] && (
                        <div className="border-t border-border bg-gray-900">
                            {/* Output Header with Close Button */}
                            <div className="flex items-center justify-between border-b border-border bg-gray-800 px-4 py-2">
                                <h4 className="text-sm font-semibold text-gray-300">Output</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCodeOutput(prev => {
                                        const newOutput = { ...prev };
                                        delete newOutput[currentQuestion?.id];
                                        return newOutput;
                                    })}
                                    className="h-6 px-2 text-gray-400 hover:text-white"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            {/* Scrollable Output Content */}
                            <div className="max-h-48 overflow-y-auto p-4">
                                <pre className="rounded-lg bg-black p-4 text-sm text-green-400 whitespace-pre-wrap font-mono">
                                    {codeOutput[currentQuestion?.id]}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between border-t border-border bg-card p-4">
                        <div className="flex gap-2">
                            {/* Toggle Question Panel */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                                className="bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                            >
                                {showQuestionPanel ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                        Hide Question
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                        Show Question
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => runCode(currentQuestion?.id)}
                                disabled={submissions[currentQuestion?.id]}
                                className="bg-purple-600/10 border-purple-600/30 hover:bg-purple-600/20"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Run Code
                            </Button>
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
                            onClick={(e) => requestSubmitQuestion(currentQuestion?.id, e)}
                            disabled={submissions[currentQuestion?.id] || submitting}
                            className="min-w-[180px]"
                        >
                            {submitting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Submitting...
                                </>
                            ) : submissions[currentQuestion?.id] ? (
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
        </div >
    );
}

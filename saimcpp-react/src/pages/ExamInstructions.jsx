import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Clock, Shield, AlertTriangle, Monitor, CheckCircle2 } from 'lucide-react';

export default function ExamInstructions() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [canStart, setCanStart] = useState(true); // Changed to true - no delay

    // Removed countdown logic - users can start immediately

    const handleStart = () => {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
        navigate(`/mock-exam/${examId}/exam`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Final Examination</h1>
                    <p className="text-gray-400">PF Lab Fall 2024 • Proctored Session</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Exam Config */}
                    <div className="bg-gray-900/50 border border-t-purple-500/50 border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Parameters</h2>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                <span className="text-gray-400">Duration</span>
                                <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">180 Mins</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                <span className="text-gray-400">Questions</span>
                                <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">3 Random</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                <span className="text-gray-400">Max Score</span>
                                <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">75 Marks</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                <span className="text-gray-400">Mode</span>
                                <span className="font-mono text-red-400 bg-red-900/20 px-3 py-1 rounded">Strict Mode</span>
                            </li>
                        </ul>
                    </div>

                    {/* Rules */}
                    <div className="bg-gray-900/50 border border-t-red-500/50 border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Shield className="w-6 h-6 text-red-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Protocol</h2>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start gap-3 bg-red-500/5 p-3 rounded border border-red-500/10">
                                <Monitor className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-red-300">Fullscreen Enforcement</strong>
                                    Exit fullscreen = Violation recorded.
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-red-500/5 p-3 rounded border border-red-500/10">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-red-300">Tab Focus Failure</strong>
                                    Switching tabs/windows is strictly prohibited.
                                </div>
                            </li>
                            <li className="text-xs text-center text-gray-500 pt-2">
                                3 Violations = Immediate Automatic Submission
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button
                            size="lg"
                            onClick={handleStart}
                            className="bg-white text-black hover:bg-gray-200 px-12 py-6 text-lg font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                        >
                            START EXAMINATION
                        </Button>
                        <p className="mt-4 text-xs text-gray-500">
                            By proceeding, you confirm all background apps are closed.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

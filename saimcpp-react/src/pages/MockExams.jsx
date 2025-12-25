import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, FileText, AlertTriangle } from 'lucide-react';

export default function MockExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
    }, []);

    async function fetchExams() {
        const { data, error } = await supabase
            .from('mock_exams')
            .select('*')
            .eq('is_active', true);

        if (!error) {
            setExams(data);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⏳</div>
                    <p className="text-muted-foreground">Loading exams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-3 text-4xl font-bold">Mock Exams</h1>
                <p className="text-lg text-muted-foreground">
                    Test your skills with timed exams. Strict anti-cheating measures enforced.
                </p>
            </div>

            {/* Exams List */}
            <div className="space-y-6">
                {exams.map((exam, index) => (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-6 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="mb-2 text-2xl font-bold">{exam.title}</h2>
                                    <p className="mb-4 text-muted-foreground">{exam.description}</p>

                                    <div className="mb-4 flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-accent-blue" />
                                            <span className="font-medium">{exam.duration_minutes} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-accent-green" />
                                            <span className="font-medium">{exam.total_marks} marks</span>
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    <div className="mb-4 rounded-lg border border-warning bg-warning/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                                            <div className="text-sm">
                                                <p className="mb-2 font-semibold">Anti-Cheating Measures Active:</p>
                                                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                                    <li>No tab switching allowed (3 violations = auto-submit)</li>
                                                    <li>Copy-paste disabled</li>
                                                    <li>Must stay in fullscreen mode</li>
                                                    <li>Timer cannot be paused</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate(`/mock-exam/${exam.id}/instructions`)}
                                className="w-full"
                            >
                                Start Exam
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

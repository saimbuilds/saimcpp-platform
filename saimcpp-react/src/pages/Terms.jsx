import { motion } from 'framer-motion'
import { Card } from '../components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl">
                <motion.button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ x: -4 }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
                    <p className="mb-8 text-muted-foreground">Last updated: December 26, 2024</p>

                    <Card className="p-8">
                        <div className="prose prose-invert max-w-none">
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Vexilot ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.
                            </p>

                            <h2>2. Description of Service</h2>
                            <p>
                                Vexilot provides an online competitive programming platform for students to practice coding problems, participate in mock exams, and track their progress through leaderboards and analytics.
                            </p>

                            <h2>3. User Accounts</h2>
                            <p>
                                You must create an account to access certain features. You are responsible for:
                            </p>
                            <ul>
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                            </ul>

                            <h2>4. Free and Paid Services</h2>
                            <p>
                                <strong>Free Tier:</strong> Unlimited access to problems and mock exams, basic leaderboards.
                            </p>
                            <p>
                                <strong>Professional Tier:</strong> Full access to all features including custom rooms, AI code review, and advanced analytics. Pricing and features are subject to change with notice.
                            </p>

                            <h2>5. User Conduct</h2>
                            <p>You agree not to:</p>
                            <ul>
                                <li>Share solutions or engage in plagiarism</li>
                                <li>Use automated tools to solve problems</li>
                                <li>Attempt to gain unauthorized access to the Platform</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Upload malicious code or viruses</li>
                            </ul>

                            <h2>6. Intellectual Property</h2>
                            <p>
                                All content on the Platform, including problems, solutions, and educational materials, is owned by Vexilot or its licensors. You may not reproduce, distribute, or create derivative works without permission.
                            </p>

                            <h2>7. Code Submissions</h2>
                            <p>
                                By submitting code to the Platform, you grant Vexilot a non-exclusive license to use, store, and analyze your submissions for the purpose of providing the service and improving the Platform.
                            </p>

                            <h2>8. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion.
                            </p>

                            <h2>9. Disclaimer of Warranties</h2>
                            <p>
                                The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
                            </p>

                            <h2>10. Limitation of Liability</h2>
                            <p>
                                Vexilot shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform.
                            </p>

                            <h2>11. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.
                            </p>

                            <h2>12. Governing Law</h2>
                            <p>
                                These terms shall be governed by the laws of Pakistan. Any disputes shall be resolved in the courts of Pakistan.
                            </p>

                            <h2>13. Contact</h2>
                            <p>
                                For questions about these Terms of Service, contact us at:{' '}
                                <a href="mailto:vexilot.dev@gmail.com" className="text-purple-500 hover:underline">
                                    vexilot.dev@gmail.com
                                </a>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

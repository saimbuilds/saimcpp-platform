import { motion } from 'framer-motion'
import { Card } from '../components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
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
                    <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
                    <p className="mb-8 text-muted-foreground">Last updated: December 26, 2024</p>

                    <Card className="p-8">
                        <div className="prose prose-invert max-w-none">
                            <h2>1. Introduction</h2>
                            <p>
                                Vexilot ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                            </p>

                            <h2>2. Information We Collect</h2>

                            <h3>2.1 Information You Provide</h3>
                            <ul>
                                <li><strong>Account Information:</strong> Name, email address, and profile picture (via Google Sign-In)</li>
                                <li><strong>Code Submissions:</strong> Your code solutions and problem attempts</li>
                                <li><strong>User Content:</strong> Any content you create or share on the Platform</li>
                            </ul>

                            <h3>2.2 Automatically Collected Information</h3>
                            <ul>
                                <li><strong>Usage Data:</strong> Pages visited, time spent, problems solved, exam scores</li>
                                <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                                <li><strong>Cookies:</strong> We use cookies to maintain your session and preferences</li>
                            </ul>

                            <h2>3. How We Use Your Information</h2>
                            <p>We use your information to:</p>
                            <ul>
                                <li>Provide and maintain the Platform</li>
                                <li>Track your progress and display leaderboards</li>
                                <li>Analyze your code submissions for grading</li>
                                <li>Send important updates about the Platform</li>
                                <li>Improve our services and develop new features</li>
                                <li>Prevent fraud and ensure platform security</li>
                            </ul>

                            <h2>4. Information Sharing</h2>
                            <p>We do not sell your personal information. We may share information:</p>
                            <ul>
                                <li><strong>Publicly:</strong> Your username, profile picture, and leaderboard rankings are visible to other users</li>
                                <li><strong>Service Providers:</strong> With third-party services like Supabase (database) and Piston API (code execution)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            </ul>

                            <h2>5. Data Security</h2>
                            <p>
                                We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. We use:
                            </p>
                            <ul>
                                <li>Encrypted connections (HTTPS)</li>
                                <li>Secure authentication via Google OAuth</li>
                                <li>Regular security audits</li>
                                <li>Access controls and monitoring</li>
                            </ul>

                            <h2>6. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct your information</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                <li><strong>Export:</strong> Download your code submissions and progress data</li>
                            </ul>

                            <h2>7. Data Retention</h2>
                            <p>
                                We retain your data as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where required by law.
                            </p>

                            <h2>8. Third-Party Services</h2>
                            <p>We use the following third-party services:</p>
                            <ul>
                                <li><strong>Google OAuth:</strong> For authentication</li>
                                <li><strong>Supabase:</strong> For database and authentication</li>
                                <li><strong>Piston API:</strong> For code execution</li>
                            </ul>
                            <p>These services have their own privacy policies governing their use of your information.</p>

                            <h2>9. Children's Privacy</h2>
                            <p>
                                Our Platform is intended for users aged 13 and above. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us.
                            </p>

                            <h2>10. International Users</h2>
                            <p>
                                Your information may be transferred to and processed in countries other than Pakistan. By using the Platform, you consent to such transfers.
                            </p>

                            <h2>11. Changes to Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.
                            </p>

                            <h2>12. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy or want to exercise your rights, contact us at:{' '}
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

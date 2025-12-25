import { Github, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
    const socialLinks = [
        {
            name: 'GitHub',
            url: 'https://github.com/saimbuilds/saimcpp-platform',
            icon: Github,
            label: 'Star on GitHub',
        },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/saimsys/',
            icon: Linkedin,
            label: 'Connect on LinkedIn',
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/saim_sys/',
            icon: Instagram,
            label: 'Follow on Instagram',
        },
    ]

    return (
        <footer className="border-t border-border bg-card py-8">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-2 text-foreground">
                    Made with 💙 by <strong>Saim</strong>
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                    If you find this helpful, show some support!
                </p>

                {/* Ambassador Program Link */}
                <div className="mb-6">
                    <a
                        href="/ambassadors"
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/10 to-purple-400/10 px-6 py-2.5 text-sm font-semibold text-purple-400 transition-all hover:border-purple-500/50 hover:from-purple-600/20 hover:to-purple-400/20"
                    >
                        🚀 Become a Campus Ambassador
                    </a>
                </div>

                <div className="flex items-center justify-center gap-4">
                    {socialLinks.map(({ name, url, icon: Icon, label }) => (
                        <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-all hover:border-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue"
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}

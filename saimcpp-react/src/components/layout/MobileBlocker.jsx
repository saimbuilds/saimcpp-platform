import { useEffect, useState } from 'react'

export default function MobileBlocker() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    if (!isMobile) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background to-card p-6">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
                <div className="mb-4 animate-bounce text-5xl">💻</div>
                <h1 className="mb-2 bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-3xl font-bold text-transparent">
                    Desktop Only, Please!
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    SaimCPP requires a larger screen for the best coding experience
                </p>

                <div className="mb-6 space-y-3 rounded-xl bg-secondary p-4 text-left">
                    <div className="flex items-center gap-3 border-b border-border pb-3 text-sm">
                        <span className="text-xl">⌨️</span>
                        <span>Full keyboard needed for coding</span>
                    </div>
                    <div className="flex items-center gap-3 border-b border-border pb-3 text-sm">
                        <span className="text-xl">🖥️</span>
                        <span>Monaco editor requires desktop</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-xl">🎯</span>
                        <span>Better focus on larger screens</span>
                    </div>
                </div>

                <p className="mb-6 text-base font-semibold text-accent-blue">
                    Switch to your laptop or desktop to start grinding! 🚀
                </p>

                <div className="border-t border-border pt-4 text-xs text-muted">
                    Minimum screen width: <strong className="text-accent-blue">1024px</strong>
                </div>
            </div>
        </div>
    )
}

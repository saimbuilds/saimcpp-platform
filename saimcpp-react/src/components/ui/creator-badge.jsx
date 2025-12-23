// Special badge component for the app creator
export function CreatorBadge() {
    return (
        <div className="relative inline-flex items-center">
            {/* Animated glow */}
            <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-75 blur-sm"></div>

            {/* Badge */}
            <div className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                <span className="animate-pulse">👑</span>
                <span>CREATOR</span>
                <span className="animate-pulse">⚡</span>
            </div>
        </div>
    )
}

// Helper function to check if user is the creator
export const isCreator = (email) => {
    return email === 'saimkhanwah@gmail.com'
}

// Glowing wrapper for creator's elements
export function CreatorGlow({ children, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            {/* Animated border glow */}
            <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-30 blur"></div>
            <div className="relative">{children}</div>
        </div>
    )
}

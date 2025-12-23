import { useNavigate } from 'react-router-dom'
import { Button } from './button'
import { Crown, Sparkles } from 'lucide-react'

export default function FounderButton() {
    const navigate = useNavigate()

    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-30 blur"></div>

            {/* Button */}
            <Button
                onClick={() => navigate('/u/saimkhan')}
                className="relative flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-purple-700"
                size="sm"
            >
                <Crown className="h-4 w-4 animate-pulse" />
                <span className="font-bold">Meet the Founder</span>
                <Sparkles className="h-4 w-4 animate-pulse" />
            </Button>
        </div>
    )
}

import { useNavigate } from 'react-router-dom'
import { Button } from './button'
import { User } from 'lucide-react'

export default function FounderButton() {
    const navigate = useNavigate()

    return (
        <Button
            onClick={() => navigate('/u/saimbuilds')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-purple-600 hover:shadow-purple-500/50"
            size="sm"
        >
            <User className="h-4 w-4" />
            <span className="font-medium">Meet the Founder</span>
        </Button>
    )
}

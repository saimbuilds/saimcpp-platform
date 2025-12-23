import { Outlet } from 'react-router-dom'

export default function Dashboard() {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted">
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    )
}

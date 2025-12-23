import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export default function Dashboard() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto max-w-7xl px-8 py-8">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    )
}

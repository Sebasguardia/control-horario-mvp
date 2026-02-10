import React from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Navbar } from '@/components/dashboard/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
                <Navbar />

                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

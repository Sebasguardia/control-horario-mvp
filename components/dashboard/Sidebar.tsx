'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
        // En desktop, siempre abrir el sidebar
        const checkDesktop = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true)
            }
        }
        checkDesktop()
        window.addEventListener('resize', checkDesktop)
        return () => window.removeEventListener('resize', checkDesktop)
    }, [])

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden bg-background border shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Backdrop (Mobile) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    'h-screen w-64 bg-card border-r border-border flex flex-col',
                    // Desktop: siempre visible y estático
                    'lg:static lg:translate-x-0',
                    // Mobile: fixed con animación
                    'fixed top-0 left-0 z-40 shadow-lg lg:shadow-none',
                    // En móvil, controlado por isOpen. En desktop siempre visible
                    mounted && (isOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'),
                    'transition-transform duration-300 ease-in-out'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 p-6 border-b border-border">
                    <div className="rounded-lg bg-primary p-2">
                        <Clock className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Control Horario</h2>
                        <p className="text-xs text-muted-foreground">MVP v1.0</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    // Solo cerrar en móvil
                                    if (window.innerWidth < 1024) {
                                        setIsOpen(false)
                                    }
                                }}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                    <p className="text-xs opacity-80 truncate">{item.description}</p>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <div className="text-xs text-muted-foreground text-center">
                        © 2026 Control Horario MVP
                    </div>
                </div>
            </aside>
        </>
    )
}

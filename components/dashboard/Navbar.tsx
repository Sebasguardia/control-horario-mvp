'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function Navbar() {
    const { user, perfil, signOut } = useAuth()
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState('')

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(format(new Date(), 'HH:mm:ss'))
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleSignOut = async () => {
        await signOut()
    }

    const getInitials = (name: string | null) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getSaludo = () => {
        const hora = new Date().getHours()
        if (hora < 12) return 'Buenos días'
        if (hora < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6 gap-4">
                {/* Left Section - Greeting */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="min-w-0">
                        <h2 className="text-base lg:text-lg font-semibold truncate">
                            {getSaludo()}, {perfil?.nombre_completo?.split(' ')[0] || 'Usuario'}
                        </h2>
                        <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                            {format(new Date(), 'EEEE, d')} de {format(new Date(), 'MMMM')}
                        </p>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                    {/* Current Time */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-mono text-sm font-medium">{currentTime}</span>
                    </div>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            3
                        </Badge>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={perfil?.avatar_url || ''} alt={perfil?.nombre_completo || ''} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {getInitials(perfil?.nombre_completo || null)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {perfil?.nombre_completo || 'Usuario'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                    {perfil?.cargo && (
                                        <p className="text-xs leading-none text-muted-foreground mt-1">
                                            {perfil.cargo} • {perfil.departamento}
                                        </p>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/perfil')}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Mi Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/perfil')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configuración</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
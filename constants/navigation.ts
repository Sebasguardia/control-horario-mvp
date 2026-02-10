import {
    LayoutDashboard,
    Clock,
    History,
    BarChart3,
    User,
    type LucideIcon
} from 'lucide-react'

export interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    description: string
}

export const navigation: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Vista general y resumen',
    },
    {
        title: 'Control de Jornada',
        href: '/jornada',
        icon: Clock,
        description: 'Iniciar, pausar y finalizar jornada',
    },
    {
        title: 'Historial',
        href: '/historial',
        icon: History,
        description: 'Registro de jornadas anteriores',
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: BarChart3,
        description: 'Gráficas y estadísticas',
    },
    {
        title: 'Perfil',
        href: '/perfil',
        icon: User,
        description: 'Configuración de cuenta',
    },
]
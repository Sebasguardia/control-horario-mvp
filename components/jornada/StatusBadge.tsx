import { Badge } from '@/components/ui/badge'
import { estadoColors } from '@/constants/colors'
import type { EstadoJornada } from '@/types/jornada.types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    estado: EstadoJornada
    className?: string
}

const estadoLabels: Record<EstadoJornada, string> = {
    sin_iniciar: 'Sin Iniciar',
    activa: 'Activa',
    pausada: 'Pausada',
    finalizada: 'Finalizada',
}

export function StatusBadge({ estado, className }: StatusBadgeProps) {
    const colors = estadoColors[estado]

    return (
        <Badge
            variant="outline"
            className={cn(
                'px-4 py-1.5 text-sm font-medium',
                colors.text,
                colors.bg,
                colors.border,
                className
            )}
        >
            <div className={cn('mr-2 h-2 w-2 rounded-full', colors.badge)} />
            {estadoLabels[estado]}
        </Badge>
    )
}
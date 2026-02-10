import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Jornada } from '@/types/jornada.types'
import { formatearHora, formatearSegundosAHoras } from '@/lib/utils/formatters'
import { Play, Pause, RotateCcw, Square, Clock } from 'lucide-react'

interface EventTimelineProps {
    jornada: Jornada
}

export function EventTimeline({ jornada }: EventTimelineProps) {
    const eventos = [
        {
            tipo: 'inicio',
            hora: jornada.hora_inicio,
            label: 'Jornada iniciada',
            icon: Play,
            color: 'text-green-600',
        },
        jornada.hora_pausa_inicio && {
            tipo: 'pausa',
            hora: jornada.hora_pausa_inicio,
            label: 'Pausa iniciada',
            icon: Pause,
            color: 'text-yellow-600',
        },
        jornada.hora_pausa_fin && {
            tipo: 'reanudacion',
            hora: jornada.hora_pausa_fin,
            label: 'Jornada reanudada',
            icon: RotateCcw,
            color: 'text-blue-600',
        },
        jornada.hora_finalizacion && {
            tipo: 'fin',
            hora: jornada.hora_finalizacion,
            label: 'Jornada finalizada',
            icon: Square,
            color: 'text-red-600',
        },
    ].filter(Boolean)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline de Hoy
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {eventos.map((evento: any, index) => {
                        const Icon = evento.icon
                        return (
                            <div key={evento.tipo}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${evento.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{evento.label}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatearHora(evento.hora)}
                                        </p>
                                    </div>
                                </div>
                                {index < eventos.length - 1 && (
                                    <Separator className="my-3 ml-7" />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Resumen */}
                {jornada.estado === 'finalizada' && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                Total trabajado:
                            </span>
                            <span className="text-lg font-bold">
                                {formatearSegundosAHoras(jornada.tiempo_trabajado_segundos)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
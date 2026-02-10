'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Jornada } from '@/types/jornada.types'
import { formatearSegundosAHoras } from '@/lib/utils/formatters'

interface MonthCalendarProps {
    jornadas: Jornada[]
}

export function MonthCalendar({ jornadas }: MonthCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    // Encontrar jornada del día seleccionado
    const jornadaDelDia = selectedDate
        ? jornadas.find((j) => isSameDay(new Date(j.fecha), selectedDate))
        : null

    // Días con jornadas (para marcar en el calendario)
    const diasConJornada = jornadas.map((j) => new Date(j.fecha))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Calendario del Mes</CardTitle>
                <CardDescription>
                    Visualiza tus días trabajados del mes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Calendario */}
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    className="rounded-md border"
                    modifiers={{
                        trabajado: diasConJornada,
                    }}
                    modifiersClassNames={{
                        trabajado: 'bg-primary/10 font-bold',
                    }}
                />

                {/* Detalles del día seleccionado */}
                {selectedDate && (
                    <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                            </h4>
                            {jornadaDelDia && (
                                <Badge
                                    variant={
                                        jornadaDelDia.estado === 'finalizada'
                                            ? 'default'
                                            : jornadaDelDia.estado === 'activa'
                                                ? 'default'
                                                : 'secondary'
                                    }
                                >
                                    {jornadaDelDia.estado}
                                </Badge>
                            )}
                        </div>

                        {jornadaDelDia ? (
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Inicio:</span>
                                    <span className="font-medium">
                                        {jornadaDelDia.hora_inicio
                                            ? format(new Date(jornadaDelDia.hora_inicio), 'HH:mm')
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fin:</span>
                                    <span className="font-medium">
                                        {jornadaDelDia.hora_finalizacion
                                            ? format(new Date(jornadaDelDia.hora_finalizacion), 'HH:mm')
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total trabajado:</span>
                                    <span className="font-medium">
                                        {formatearSegundosAHoras(jornadaDelDia.tiempo_trabajado_segundos)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No hay registro de jornada para este día
                            </p>
                        )}
                    </div>
                )}

                {/* Leyenda */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-primary/10 border border-primary" />
                        <span>Día trabajado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm border" />
                        <span>Sin registro</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
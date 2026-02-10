'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Jornada } from '@/types/jornada.types'
import {
    formatearFecha,
    formatearHora,
    formatearSegundosAHoras,
} from '@/lib/utils/formatters'
import { StatusBadge } from '@/components/jornada/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { History } from 'lucide-react'
import { motion } from 'framer-motion'

interface HistorialTableProps {
    jornadas: Jornada[]
}

export function HistorialTable({ jornadas }: HistorialTableProps) {
    if (jornadas.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <EmptyState
                        icon={History}
                        title="No hay registros"
                        description="No se encontraron jornadas en el rango de fechas seleccionado"
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block">
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Pausa</TableHead>
                                    <TableHead>Fin</TableHead>
                                    <TableHead>Tiempo Trabajado</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jornadas.map((jornada, index) => (
                                    <motion.tr
                                        key={jornada.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            {formatearFecha(jornada.fecha)}
                                        </TableCell>
                                        <TableCell>
                                            {jornada.hora_inicio
                                                ? formatearHora(jornada.hora_inicio)
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {jornada.hora_pausa_inicio && jornada.hora_pausa_fin
                                                ? `${formatearHora(jornada.hora_pausa_inicio)} - ${formatearHora(jornada.hora_pausa_fin)}`
                                                : jornada.hora_pausa_inicio
                                                    ? `${formatearHora(jornada.hora_pausa_inicio)} (En pausa)`
                                                    : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {jornada.hora_finalizacion
                                                ? formatearHora(jornada.hora_finalizacion)
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatearSegundosAHoras(jornada.tiempo_trabajado_segundos)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge estado={jornada.estado} />
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-3">
                {jornadas.map((jornada, index) => (
                    <motion.div
                        key={jornada.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">
                                        {formatearFecha(jornada.fecha)}
                                    </h4>
                                    <StatusBadge estado={jornada.estado} />
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Inicio</p>
                                        <p className="font-medium">
                                            {jornada.hora_inicio
                                                ? formatearHora(jornada.hora_inicio)
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Fin</p>
                                        <p className="font-medium">
                                            {jornada.hora_finalizacion
                                                ? formatearHora(jornada.hora_finalizacion)
                                                : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">
                                        Total trabajado
                                    </span>
                                    <span className="text-lg font-bold">
                                        {formatearSegundosAHoras(jornada.tiempo_trabajado_segundos)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </>
    )
}
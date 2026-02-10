'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react'
import { formatearSegundosAHoras } from '@/lib/utils/formatters'
import type { ResumenEstadisticas } from '@/hooks/useReportes'
import { motion } from 'framer-motion'

interface StatsGridProps {
    stats: ResumenEstadisticas
}

export function StatsGrid({ stats }: StatsGridProps) {
    const insights = [
        {
            title: 'Total del Mes',
            value: formatearSegundosAHoras(stats.totalHorasMes),
            icon: Calendar,
            description: `${stats.diasTrabajadosMes} días trabajados`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Promedio Diario',
            value: formatearSegundosAHoras(Math.floor(stats.promedioDiario)),
            icon: Target,
            description: 'Meta: 8h/día',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Rendimiento',
            value: stats.promedioDiario >= 8 * 3600 ? '✓ Excelente' : '⚠ Mejorable',
            icon: stats.promedioDiario >= 8 * 3600 ? TrendingUp : TrendingDown,
            description: stats.promedioDiario >= 8 * 3600 ? 'Por encima de la meta' : 'Por debajo de la meta',
            color: stats.promedioDiario >= 8 * 3600 ? 'text-green-600' : 'text-orange-600',
            bgColor: stats.promedioDiario >= 8 * 3600 ? 'bg-green-50' : 'bg-orange-50',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {insights.map((insight, index) => {
                const Icon = insight.icon
                return (
                    <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {insight.title}
                                </CardTitle>
                                <div className={`rounded-full p-2 ${insight.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${insight.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{insight.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {insight.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
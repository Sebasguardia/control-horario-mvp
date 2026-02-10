'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, TrendingUp, Target } from 'lucide-react'
import { formatearSegundosAHoras } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
    horasHoy: number
    horasSemana: number
    horasMes: number
    promedioDiario: number
}

export function StatsCards({
    horasHoy,
    horasSemana,
    horasMes,
    promedioDiario,
}: StatsCardsProps) {
    const stats = [
        {
            title: 'Horas Hoy',
            value: formatearSegundosAHoras(horasHoy),
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: horasHoy >= 8 * 3600 ? '+15%' : '-5%',
            changeType: horasHoy >= 8 * 3600 ? 'positive' : 'neutral',
        },
        {
            title: 'Esta Semana',
            value: formatearSegundosAHoras(horasSemana),
            icon: Calendar,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '▲ 2h vs pasada',
            changeType: 'positive',
        },
        {
            title: 'Este Mes',
            value: formatearSegundosAHoras(horasMes),
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: '✓ Meta cumplida',
            changeType: 'positive',
        },
        {
            title: 'Promedio Diario',
            value: formatearSegundosAHoras(Math.floor(promedioDiario)),
            icon: Target,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            change: '⭐ Excelente',
            changeType: 'positive',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn('rounded-full p-2', stat.bgColor)}>
                                    <Icon className={cn('h-4 w-4', stat.color)} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p
                                    className={cn(
                                        'text-xs mt-1',
                                        stat.changeType === 'positive'
                                            ? 'text-green-600'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
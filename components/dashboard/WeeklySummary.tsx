'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatearSegundosAHoras } from '@/lib/utils/formatters'
import type { EstadisticasDiarias } from '@/hooks/useReportes'

interface WeeklySummaryProps {
    data: EstadisticasDiarias[]
}

export function WeeklySummary({ data }: WeeklySummaryProps) {
    // Convertir segundos a horas para el gráfico
    const chartData = data.map((item) => ({
        dia: item.fecha,
        horas: Number((item.segundos / 3600).toFixed(1)),
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                    <p className="text-sm font-medium">{payload[0].payload.dia}</p>
                    <p className="text-sm text-primary">
                        {payload[0].value}h trabajadas
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Horas por Día - Esta Semana</CardTitle>
                <CardDescription>
                    Resumen de horas trabajadas en los últimos 7 días
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="dia"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="horas"
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                            className="hover:opacity-80 transition-opacity"
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Leyenda */}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-primary" />
                        <span>Horas trabajadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-4 bg-muted" />
                        <span>Meta: 8h/día</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
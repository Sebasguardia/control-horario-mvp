'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import type { EstadisticasDiarias } from '@/hooks/useReportes'

interface HoursChartProps {
    data: EstadisticasDiarias[]
    title?: string
    description?: string
}

export function HoursChart({
    data,
    title = 'Tendencia de Horas Trabajadas',
    description = 'Visualización de horas trabajadas en el período',
}: HoursChartProps) {
    const chartData = data.map((item) => ({
        fecha: item.fecha,
        horas: Number((item.segundos / 3600).toFixed(2)),
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-1">{payload[0].payload.fecha}</p>
                    <p className="text-sm text-primary font-semibold">
                        {payload[0].value.toFixed(2)} horas
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="fecha"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            label={{
                                value: 'Horas',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: 'hsl(var(--muted-foreground))' },
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="horas"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Horas trabajadas"
                        />
                        {/* Línea de referencia de 8 horas */}
                        <Line
                            type="monotone"
                            dataKey={() => 8}
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="5 5"
                            strokeWidth={1}
                            dot={false}
                            name="Meta (8h)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
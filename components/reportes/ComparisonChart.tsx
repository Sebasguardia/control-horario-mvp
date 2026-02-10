'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

interface ComparisonChartProps {
    semanaActual: number
    semanaAnterior: number
}

export function ComparisonChart({ semanaActual, semanaAnterior }: ComparisonChartProps) {
    const data = [
        {
            name: 'Semana Anterior',
            horas: Number((semanaAnterior / 3600).toFixed(1)),
        },
        {
            name: 'Semana Actual',
            horas: Number((semanaActual / 3600).toFixed(1)),
        },
    ]

    const diferencia = semanaActual - semanaAnterior
    const porcentajeCambio = semanaAnterior > 0
        ? ((diferencia / semanaAnterior) * 100).toFixed(1)
        : '0'

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium">{payload[0].payload.name}</p>
                    <p className="text-sm text-primary font-semibold">
                        {payload[0].value} horas
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comparativa Semanal</CardTitle>
                <CardDescription>
                    Comparación de horas trabajadas entre semanas
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
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
                        <Bar
                            dataKey="horas"
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                            name="Horas trabajadas"
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Estadística de cambio */}
                <div className="mt-4 p-4 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground mb-1">Cambio respecto a la semana anterior</p>
                    <p className={`text-2xl font-bold ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diferencia >= 0 ? '+' : ''}{(diferencia / 3600).toFixed(1)}h ({porcentajeCambio}%)
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
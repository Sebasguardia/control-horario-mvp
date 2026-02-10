'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AttendanceChartProps {
    diasTrabajados: number
    diasTotales: number
}

export function AttendanceChart({ diasTrabajados, diasTotales }: AttendanceChartProps) {
    const diasNoTrabajados = diasTotales - diasTrabajados

    const data = [
        { name: 'Días trabajados', value: diasTrabajados },
        { name: 'Días sin registro', value: diasNoTrabajados },
    ]

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))']

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const porcentaje = ((payload[0].value / diasTotales) * 100).toFixed(1)
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-sm text-primary font-semibold">
                        {payload[0].value} días ({porcentaje}%)
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Asistencia del Mes</CardTitle>
                <CardDescription>
                    Distribución de días trabajados vs sin registro
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <p className="text-2xl font-bold text-primary">{diasTrabajados}</p>
                        <p className="text-sm text-muted-foreground">Días trabajados</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{diasNoTrabajados}</p>
                        <p className="text-sm text-muted-foreground">Sin registro</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
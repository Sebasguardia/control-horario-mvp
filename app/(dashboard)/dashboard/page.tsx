"use client"

import React from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { MonthCalendar } from '@/components/dashboard/MonthCalendar'
import { WeeklySummary } from '@/components/dashboard/WeeklySummary'
import { useAuth } from '@/hooks/useAuth'
import { useReportes } from '@/hooks/useReportes'
import { useJornada } from '@/hooks/useJornada'

export default function DashboardPage() {
	const { user } = useAuth()
	const { resumen, estadisticasSemana, loading } = useReportes(user?.id)
	const { jornadaActual } = useJornada(user?.id)

	return (
		<div className="space-y-6">
			<StatsCards
				horasHoy={resumen.totalHorasHoy}
				horasSemana={resumen.totalHorasSemana}
				horasMes={resumen.totalHorasMes}
				promedioDiario={resumen.promedioDiario}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<WeeklySummary data={estadisticasSemana} />
				</div>

				<div className="space-y-6">
					<MonthCalendar jornadas={[]} />
				</div>
			</div>
		</div>
	)
}

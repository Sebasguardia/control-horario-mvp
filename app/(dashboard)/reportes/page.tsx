"use client"

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useReportes } from '@/hooks/useReportes'
import { StatsGrid } from '@/components/reportes/StatsGrid'
import { HoursChart } from '@/components/reportes/HoursChart'
import { AttendanceChart } from '@/components/reportes/AttendanceChart'
import { ComparisonChart } from '@/components/reportes/ComparisonChart'
import { endOfMonth, startOfMonth } from 'date-fns'

export default function ReportesPage() {
	const { user } = useAuth()
	const { resumen, estadisticasMes, estadisticasSemana } = useReportes(user?.id)

	const diasTotales = (endOfMonth(new Date()).getDate())

	return (
		<div className="space-y-6">
			<StatsGrid stats={resumen} />

			<div className="grid gap-6 lg:grid-cols-2">
				<HoursChart data={estadisticasMes} />
				<AttendanceChart diasTrabajados={resumen.diasTrabajadosMes} diasTotales={diasTotales} />
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<ComparisonChart semanaActual={resumen.totalHorasSemana} semanaAnterior={0} />
			</div>
		</div>
	)
}


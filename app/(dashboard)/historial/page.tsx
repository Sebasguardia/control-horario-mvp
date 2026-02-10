"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { FilterBar } from '@/components/historial/FilterBar'
import { ExportButton } from '@/components/historial/ExportButton'
import { HistorialTable } from '@/components/historial/HistorialTable'
import { format } from 'date-fns'

export default function HistorialPage() {
	const { user } = useAuth()
	const supabase = createClient()

	const [jornadas, setJornadas] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const fetchJornadas = async (desde?: Date, hasta?: Date) => {
		if (!user) return
		try {
			setLoading(true)
			const desdeStr = desde ? format(desde, 'yyyy-MM-dd') : undefined
			const hastaStr = hasta ? format(hasta, 'yyyy-MM-dd') : undefined

			let query = supabase.from('jornadas').select('*').eq('user_id', user.id)

			if (desdeStr) query = query.gte('fecha', desdeStr)
			if (hastaStr) query = query.lte('fecha', hastaStr)

			const { data, error } = await query.order('fecha', { ascending: false })
			if (error) throw error
			setJornadas(data || [])
		} catch (error) {
			console.error('Error al cargar jornadas:', error)
			setJornadas([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		// por defecto cargar últimos 30 días
		const hoy = new Date()
		const desde = new Date()
		desde.setDate(hoy.getDate() - 30)
		fetchJornadas(desde, hoy)
	}, [user])

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<FilterBar
					onFilter={(d, h) => fetchJornadas(d, h)}
					onClear={() => fetchJornadas()}
				/>

				<ExportButton jornadas={jornadas} disabled={loading} />
			</div>

			<HistorialTable jornadas={jornadas} />
		</div>
	)
}

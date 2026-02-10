'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Jornada } from '@/types/jornada.types'
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    format,
    eachDayOfInterval,
    isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'

export interface EstadisticasDiarias {
    fecha: string
    segundos: number
}

export interface ResumenEstadisticas {
    totalHorasHoy: number
    totalHorasSemana: number
    totalHorasMes: number
    promedioDiario: number
    diasTrabajadosMes: number
}

export function useReportes(userId: string | undefined) {
    const [loading, setLoading] = useState(true)
    const [estadisticasSemana, setEstadisticasSemana] = useState<EstadisticasDiarias[]>([])
    const [estadisticasMes, setEstadisticasMes] = useState<EstadisticasDiarias[]>([])
    const [resumen, setResumen] = useState<ResumenEstadisticas>({
        totalHorasHoy: 0,
        totalHorasSemana: 0,
        totalHorasMes: 0,
        promedioDiario: 0,
        diasTrabajadosMes: 0,
    })

    const supabase = createClient()

    const fetchEstadisticas = useCallback(async () => {
        if (!userId) return

        try {
            setLoading(true)
            const hoy = new Date()

            // Obtener jornadas del mes
            const { data: jornadasMes, error: errorMes } = await supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', userId)
                .gte('fecha', format(startOfMonth(hoy), 'yyyy-MM-dd'))
                .lte('fecha', format(endOfMonth(hoy), 'yyyy-MM-dd'))

            if (errorMes) throw errorMes

            // Obtener jornadas de la semana
            const { data: jornadasSemana, error: errorSemana } = await supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', userId)
                .gte('fecha', format(startOfWeek(hoy, { locale: es }), 'yyyy-MM-dd'))
                .lte('fecha', format(endOfWeek(hoy, { locale: es }), 'yyyy-MM-dd'))

            if (errorSemana) throw errorSemana

            // Procesar datos de la semana
            const diasSemana = eachDayOfInterval({
                start: startOfWeek(hoy, { locale: es }),
                end: endOfWeek(hoy, { locale: es }),
            })

            const estadisticasSem = diasSemana.map(dia => {
                const jornada = jornadasSemana?.find(j =>
                    isSameDay(new Date(j.fecha), dia)
                )
                return {
                    fecha: format(dia, 'EEE', { locale: es }),
                    segundos: jornada?.tiempo_trabajado_segundos || 0,
                }
            })

            setEstadisticasSemana(estadisticasSem)

            // Procesar datos del mes (por día)
            const estadisticasMensual: EstadisticasDiarias[] = (jornadasMes || []).map(j => ({
                fecha: format(new Date(j.fecha), 'dd MMM', { locale: es }),
                segundos: j.tiempo_trabajado_segundos,
            }))

            setEstadisticasMes(estadisticasMensual)

            // Calcular resumen
            const jornadaHoy = jornadasMes?.find(j =>
                isSameDay(new Date(j.fecha), hoy)
            )

            const totalSegundosSemana = (jornadasSemana || []).reduce(
                (sum, j) => sum + j.tiempo_trabajado_segundos,
                0
            )

            const totalSegundosMes = (jornadasMes || []).reduce(
                (sum, j) => sum + j.tiempo_trabajado_segundos,
                0
            )

            const diasTrabajados = (jornadasMes || []).filter(
                j => j.estado === 'finalizada'
            ).length

            setResumen({
                totalHorasHoy: jornadaHoy?.tiempo_trabajado_segundos || 0,
                totalHorasSemana: totalSegundosSemana,
                totalHorasMes: totalSegundosMes,
                promedioDiario: diasTrabajados > 0 ? totalSegundosMes / diasTrabajados : 0,
                diasTrabajadosMes: diasTrabajados,
            })

        } catch (error) {
            console.error('Error al obtener estadísticas:', error)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchEstadisticas()
    }, [fetchEstadisticas])

    return {
        loading,
        estadisticasSemana,
        estadisticasMes,
        resumen,
        refetch: fetchEstadisticas,
    }
}
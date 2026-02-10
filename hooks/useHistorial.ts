'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Jornada } from '@/types/jornada.types'
import { toast } from 'sonner'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export function useHistorial(userId: string | undefined) {
    const [jornadas, setJornadas] = useState<Jornada[]>([])
    const [loading, setLoading] = useState(true)
    const [filtros, setFiltros] = useState({
        desde: startOfMonth(new Date()),
        hasta: endOfMonth(new Date()),
    })
    const supabase = createClient()

    const fetchJornadas = useCallback(async () => {
        if (!userId) return

        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', userId)
                .gte('fecha', format(filtros.desde, 'yyyy-MM-dd'))
                .lte('fecha', format(filtros.hasta, 'yyyy-MM-dd'))
                .order('fecha', { ascending: false })

            if (error) throw error

            setJornadas(data || [])
        } catch (error) {
            console.error('Error al obtener historial:', error)
            toast.error('Error al cargar historial')
        } finally {
            setLoading(false)
        }
    }, [userId, filtros])

    useEffect(() => {
        fetchJornadas()
    }, [fetchJornadas])

    const aplicarFiltros = (desde: Date, hasta: Date) => {
        setFiltros({ desde, hasta })
    }

    const limpiarFiltros = () => {
        setFiltros({
            desde: startOfMonth(new Date()),
            hasta: endOfMonth(new Date()),
        })
    }

    return {
        jornadas,
        loading,
        filtros,
        aplicarFiltros,
        limpiarFiltros,
        refetch: fetchJornadas,
    }
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Jornada, EstadoJornada } from '@/types/jornada.types'
import { calcularTiempoTrabajado } from '@/lib/utils/calculations'
import { toast } from 'sonner'

export function useJornada(userId: string | undefined) {
    const [jornadaActual, setJornadaActual] = useState<Jornada | null>(null)
    const [loading, setLoading] = useState(true)
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
    const supabase = createClient()

    // Obtener jornada del día actual
    const fetchJornadaHoy = useCallback(async () => {
        try {
            setLoading(true)
            
            if (!userId) {
                setJornadaActual(null)
                return
            }

            const hoy = new Date().toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', userId)
                .eq('fecha', hoy)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') throw error

            setJornadaActual(data)
        } catch (error) {
            console.error('Error al obtener jornada:', error)
            toast.error('Error al cargar jornada')
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchJornadaHoy()
    }, [fetchJornadaHoy])

    // Actualizar tiempo transcurrido cada segundo
    useEffect(() => {
        if (!jornadaActual || jornadaActual.estado === 'finalizada') {
            setTiempoTranscurrido(jornadaActual?.tiempo_trabajado_segundos || 0)
            return
        }

        const calcularTiempo = () => {
            const tiempo = calcularTiempoTrabajado(
                jornadaActual.hora_inicio,
                jornadaActual.hora_finalizacion,
                jornadaActual.hora_pausa_inicio,
                jornadaActual.hora_pausa_fin
            )
            setTiempoTranscurrido(tiempo)
        }

        calcularTiempo()
        const interval = setInterval(calcularTiempo, 1000)

        // Actualizar cuando la ventana vuelve a tener foco
        const handleFocus = () => calcularTiempo()
        window.addEventListener('focus', handleFocus)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
        }
    }, [jornadaActual])

    const iniciarJornada = async () => {
        if (!userId) return { success: false, error: 'No hay usuario' }

        try {
            setLoading(true)
            const hoy = new Date().toISOString().split('T')[0]
            const ahora = new Date().toISOString()

            const { data, error } = await supabase
                .from('jornadas')
                .insert({
                    user_id: userId,
                    fecha: hoy,
                    hora_inicio: ahora,
                    estado: 'activa',
                })
                .select()
                .single()

            if (error) throw error

            setJornadaActual(data)
            toast.success('¡Jornada iniciada!')
            return { success: true, data }
        } catch (error: any) {
            console.error('Error al iniciar jornada:', error)
            toast.error(error.message || 'Error al iniciar jornada')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const pausarJornada = async () => {
        if (!jornadaActual) return { success: false, error: 'No hay jornada activa' }

        try {
            setLoading(true)
            const ahora = new Date().toISOString()

            const { data, error } = await supabase
                .from('jornadas')
                .update({
                    hora_pausa_inicio: ahora,
                    estado: 'pausada',
                    updated_at: ahora,
                })
                .eq('id', jornadaActual.id)
                .select()
                .single()

            if (error) throw error

            setJornadaActual(data)
            toast.success('Jornada pausada')
            return { success: true, data }
        } catch (error: any) {
            console.error('Error al pausar jornada:', error)
            toast.error(error.message || 'Error al pausar jornada')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const reanudarJornada = async () => {
        if (!jornadaActual) return { success: false, error: 'No hay jornada' }

        try {
            setLoading(true)
            const ahora = new Date().toISOString()

            const { data, error } = await supabase
                .from('jornadas')
                .update({
                    hora_pausa_fin: ahora,
                    estado: 'activa',
                    updated_at: ahora,
                })
                .eq('id', jornadaActual.id)
                .select()
                .single()

            if (error) throw error

            setJornadaActual(data)
            toast.success('Jornada reanudada')
            return { success: true, data }
        } catch (error: any) {
            console.error('Error al reanudar jornada:', error)
            toast.error(error.message || 'Error al reanudar jornada')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const finalizarJornada = async () => {
        if (!jornadaActual) return { success: false, error: 'No hay jornada' }

        try {
            setLoading(true)
            const ahora = new Date().toISOString()

            const tiempoFinal = calcularTiempoTrabajado(
                jornadaActual.hora_inicio,
                ahora,
                jornadaActual.hora_pausa_inicio,
                jornadaActual.hora_pausa_fin || ahora
            )

            const { data, error } = await supabase
                .from('jornadas')
                .update({
                    hora_finalizacion: ahora,
                    estado: 'finalizada',
                    tiempo_trabajado_segundos: tiempoFinal,
                    updated_at: ahora,
                })
                .eq('id', jornadaActual.id)
                .select()
                .single()

            if (error) throw error

            setJornadaActual(data)
            toast.success('¡Jornada finalizada!')
            return { success: true, data }
        } catch (error: any) {
            console.error('Error al finalizar jornada:', error)
            toast.error(error.message || 'Error al finalizar jornada')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    return {
        jornadaActual,
        loading,
        tiempoTranscurrido,
        iniciarJornada,
        pausarJornada,
        reanudarJornada,
        finalizarJornada,
        refetch: fetchJornadaHoy,
    }
}
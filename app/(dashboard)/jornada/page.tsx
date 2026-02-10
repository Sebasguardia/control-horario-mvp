"use client"

import React, { useEffect, useState } from 'react'
import { JornadaControl } from '@/components/jornada/JornadaControl'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { HistorialTable } from '@/components/historial/HistorialTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface JornadaRecord {
    id: string
    fecha: string
    hora_inicio?: string | null
    hora_pausa_inicio?: string | null
    hora_pausa_fin?: string | null
    hora_finalizacion?: string | null
    tiempo_trabajado_segundos: number
    estado: string
}

export default function JornadaPage() {
    const { user, loading: authLoading } = useAuth()
    const supabase = createClient()

    const [recientes, setRecientes] = useState<JornadaRecord[]>([])
    const [loadingRecientes, setLoadingRecientes] = useState(true)

    const fetchRecientes = async () => {
        if (!user) return
        try {
            setLoadingRecientes(true)
            const { data, error } = await supabase
                .from('jornadas')
                .select('*')
                .eq('user_id', user.id)
                .order('fecha', { ascending: false })
                .limit(7)

            if (error) throw error
            setRecientes(data || [])
        } catch (err) {
            console.error('Error al cargar jornadas recientes', err)
            setRecientes([])
        } finally {
            setLoadingRecientes(false)
        }
    }

    useEffect(() => {
        if (!authLoading && user) {
            fetchRecientes()
        } else if (!authLoading && !user) {
            setLoadingRecientes(false)
        }
    }, [user, authLoading])

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                {authLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner text="Cargando jornada..." />
                    </div>
                ) : (
                    <JornadaControl />
                )}
            </div>

            <aside className="space-y-4">
                <h3 className="text-lg font-semibold">Historial reciente</h3>
                {loadingRecientes ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner text="Cargando..." />
                    </div>
                ) : (
                    <HistorialTable jornadas={recientes as any} />
                )}
            </aside>
        </div>
    )
}

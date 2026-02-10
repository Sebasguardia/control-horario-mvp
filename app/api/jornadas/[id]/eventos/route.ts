import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/jornadas/[id]/eventos - Obtener eventos de una jornada
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // ← CAMBIO CLAVE

        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { data: jornada } = await supabase
            .from('jornadas')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!jornada) {
            return NextResponse.json(
                { error: 'Jornada no encontrada' },
                { status: 404 }
            )
        }

        const { data, error } = await supabase
            .from('eventos_jornada')
            .select('*')
            .eq('jornada_id', id)
            .order('timestamp', { ascending: true })

        if (error) {
            console.error('Error al obtener eventos:', error)
            return NextResponse.json(
                { error: 'Error al obtener eventos' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/jornadas/[id]/eventos:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// POST /api/jornadas/[id]/eventos - Crear evento de jornada
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // ← CAMBIO CLAVE

        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { data: jornada } = await supabase
            .from('jornadas')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!jornada) {
            return NextResponse.json(
                { error: 'Jornada no encontrada' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { tipo_evento, metadata } = body

        if (
            !tipo_evento ||
            !['inicio', 'pausa', 'reanudacion', 'finalizacion'].includes(tipo_evento)
        ) {
            return NextResponse.json(
                { error: 'Tipo de evento inválido' },
                { status: 400 }
            )
        }

        const ahora = new Date().toISOString()

        const { data, error } = await supabase
            .from('eventos_jornada')
            .insert({
                jornada_id: id,
                tipo_evento,
                timestamp: ahora,
                metadata: metadata || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error al crear evento:', error)
            return NextResponse.json(
                { error: 'Error al crear evento' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Error en POST /api/jornadas/[id]/eventos:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

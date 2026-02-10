import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/jornadas - Listar jornadas del usuario
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const fechaDesde = searchParams.get('desde')
        const fechaHasta = searchParams.get('hasta')
        const limit = searchParams.get('limit')

        let query = supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', user.id)
            .order('fecha', { ascending: false })

        if (fechaDesde) {
            query = query.gte('fecha', fechaDesde)
        }

        if (fechaHasta) {
            query = query.lte('fecha', fechaHasta)
        }

        if (limit) {
            query = query.limit(parseInt(limit))
        }

        const { data, error } = await query

        if (error) {
            console.error('Error al obtener jornadas:', error)
            return NextResponse.json(
                { error: 'Error al obtener jornadas' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/jornadas:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// POST /api/jornadas - Crear/iniciar jornada
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { fecha, notas } = body

        const hoy = fecha || new Date().toISOString().split('T')[0]
        const ahora = new Date().toISOString()

        // Verificar si ya existe una jornada para hoy
        const { data: jornadaExistente } = await supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', user.id)
            .eq('fecha', hoy)
            .maybeSingle()

        if (jornadaExistente) {
            return NextResponse.json(
                { error: 'Ya existe una jornada para esta fecha' },
                { status: 400 }
            )
        }

        // Crear jornada
        const { data: jornada, error: insertError } = await supabase
            .from('jornadas')
            .insert({
                user_id: user.id,
                fecha: hoy,
                hora_inicio: ahora,
                estado: 'activa',
                notas: notas || null,
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error al crear jornada:', insertError)
            return NextResponse.json(
                { error: 'Error al crear jornada' },
                { status: 500 }
            )
        }

        // Crear evento de inicio
        await supabase
            .from('eventos_jornada')
            .insert({
                jornada_id: jornada.id,
                tipo_evento: 'inicio',
                timestamp: ahora,
            })

        return NextResponse.json({ data: jornada }, { status: 201 })
    } catch (error) {
        console.error('Error en POST /api/jornadas:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

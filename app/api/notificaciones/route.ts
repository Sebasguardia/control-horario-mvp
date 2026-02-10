import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/notificaciones - Obtener notificaciones del usuario
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
        const soloNoLeidas = searchParams.get('no_leidas') === 'true'
        const limit = searchParams.get('limit')

        let query = supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (soloNoLeidas) {
            query = query.eq('leida', false)
        }

        if (limit) {
            query = query.limit(parseInt(limit))
        }

        const { data, error } = await query

        if (error) {
            console.error('Error al obtener notificaciones:', error)
            return NextResponse.json(
                { error: 'Error al obtener notificaciones' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/notificaciones:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// POST /api/notificaciones - Crear notificación (útil para admin o sistema)
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
        const { user_id, tipo, titulo, mensaje } = body

        // Solo puede crear notificaciones para sí mismo o ser admin
        const targetUserId = user_id || user.id

        if (targetUserId !== user.id) {
            // Aquí podrías agregar verificación de rol admin
            return NextResponse.json(
                { error: 'No autorizado para crear notificaciones para otros usuarios' },
                { status: 403 }
            )
        }

        if (!tipo || !titulo) {
            return NextResponse.json(
                { error: 'Tipo y título son requeridos' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('notificaciones')
            .insert({
                user_id: targetUserId,
                tipo,
                titulo,
                mensaje: mensaje || null,
                leida: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Error al crear notificación:', error)
            return NextResponse.json(
                { error: 'Error al crear notificación' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Error en POST /api/notificaciones:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

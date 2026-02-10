import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// PATCH /api/notificaciones/[id] - Marcar notificación como leída
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar que la notificación pertenece al usuario
        const { data: notificacionExistente } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single()

        if (!notificacionExistente) {
            return NextResponse.json(
                { error: 'Notificación no encontrada' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const leida = body.leida !== undefined ? body.leida : true

        const { data, error } = await supabase
            .from('notificaciones')
            .update({ leida })
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            console.error('Error al actualizar notificación:', error)
            return NextResponse.json(
                { error: 'Error al actualizar notificación' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en PATCH /api/notificaciones/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// DELETE /api/notificaciones/[id] - Eliminar notificación
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar que la notificación pertenece al usuario
        const { data: notificacionExistente } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single()

        if (!notificacionExistente) {
            return NextResponse.json(
                { error: 'Notificación no encontrada' },
                { status: 404 }
            )
        }

        const { error } = await supabase
            .from('notificaciones')
            .delete()
            .eq('id', params.id)

        if (error) {
            console.error('Error al eliminar notificación:', error)
            return NextResponse.json(
                { error: 'Error al eliminar notificación' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Notificación eliminada correctamente' })
    } catch (error) {
        console.error('Error en DELETE /api/notificaciones/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

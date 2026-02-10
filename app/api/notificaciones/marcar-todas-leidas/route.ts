import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// POST /api/notificaciones/marcar-todas-leidas - Marcar todas las notificaciones como leídas
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

        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('user_id', user.id)
            .eq('leida', false)

        if (error) {
            console.error('Error al marcar notificaciones como leídas:', error)
            return NextResponse.json(
                { error: 'Error al actualizar notificaciones' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' })
    } catch (error) {
        console.error('Error en POST /api/notificaciones/marcar-todas-leidas:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

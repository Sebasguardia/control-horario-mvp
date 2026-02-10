import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/jornadas/hoy - Obtener jornada del día actual
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

        const hoy = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('jornadas')
            .select('*')
            .eq('user_id', user.id)
            .eq('fecha', hoy)
            .maybeSingle()

        if (error && error.code !== 'PGRST116') {
            console.error('Error al obtener jornada de hoy:', error)
            return NextResponse.json(
                { error: 'Error al obtener jornada' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/jornadas/hoy:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

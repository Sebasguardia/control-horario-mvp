import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/perfiles - Obtener perfil del usuario actual
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

        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (error) {
            console.error('Error al obtener perfil:', error)
            return NextResponse.json(
                { error: 'Error al obtener perfil' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/perfiles:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// PATCH /api/perfiles - Actualizar perfil del usuario actual
export async function PATCH(request: NextRequest) {
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
        const {
            nombre_completo,
            departamento,
            cargo,
            avatar_url,
            fecha_ingreso,
            hora_inicio_default,
        } = body

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo
        if (departamento !== undefined) updateData.departamento = departamento
        if (cargo !== undefined) updateData.cargo = cargo
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url
        if (fecha_ingreso !== undefined) updateData.fecha_ingreso = fecha_ingreso
        if (hora_inicio_default !== undefined) updateData.hora_inicio_default = hora_inicio_default

        // Verificar si el perfil existe
        const { data: perfilExistente } = await supabase
            .from('perfiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

        let data
        let error

        if (perfilExistente) {
            // Actualizar perfil existente
            const result = await supabase
                .from('perfiles')
                .update(updateData)
                .eq('id', user.id)
                .select()
                .single()
            data = result.data
            error = result.error
        } else {
            // Crear perfil si no existe
            const result = await supabase
                .from('perfiles')
                .insert({
                    id: user.id,
                    ...updateData,
                })
                .select()
                .single()
            data = result.data
            error = result.error
        }

        if (error) {
            console.error('Error al actualizar perfil:', error)
            return NextResponse.json(
                { error: 'Error al actualizar perfil' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en PATCH /api/perfiles:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

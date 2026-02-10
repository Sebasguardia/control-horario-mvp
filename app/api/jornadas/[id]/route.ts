import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/jornadas/[id] - Obtener jornada por ID
export async function GET(
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

        const { data, error } = await supabase
            .from('jornadas')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Jornada no encontrada' },
                    { status: 404 }
                )
            }
            console.error('Error al obtener jornada:', error)
            return NextResponse.json(
                { error: 'Error al obtener jornada' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en GET /api/jornadas/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// PATCH /api/jornadas/[id] - Actualizar jornada
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

        // Verificar que la jornada pertenece al usuario
        const { data: jornadaExistente } = await supabase
            .from('jornadas')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single()

        if (!jornadaExistente) {
            return NextResponse.json(
                { error: 'Jornada no encontrada' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const ahora = new Date().toISOString()

        // Preparar datos de actualización
        const updateData: any = {
            updated_at: ahora,
        }

        // Manejar acciones específicas
        if (body.accion === 'pausar') {
            updateData.hora_pausa_inicio = ahora
            updateData.estado = 'pausada'
        } else if (body.accion === 'reanudar') {
            updateData.hora_pausa_fin = ahora
            updateData.estado = 'activa'
        } else if (body.accion === 'finalizar') {
            updateData.hora_finalizacion = ahora
            updateData.estado = 'finalizada'
            
            // Calcular tiempo trabajado usando la función de la BD
            const { data: tiempoData } = await supabase
                .rpc('calcular_tiempo_trabajado', { jornada_id: params.id })
            
            if (tiempoData !== null) {
                updateData.tiempo_trabajado_segundos = tiempoData
            }
        } else {
            // Actualización manual de campos
            if (body.hora_inicio !== undefined) updateData.hora_inicio = body.hora_inicio
            if (body.hora_pausa_inicio !== undefined) updateData.hora_pausa_inicio = body.hora_pausa_inicio
            if (body.hora_pausa_fin !== undefined) updateData.hora_pausa_fin = body.hora_pausa_fin
            if (body.hora_finalizacion !== undefined) updateData.hora_finalizacion = body.hora_finalizacion
            if (body.estado !== undefined) updateData.estado = body.estado
            if (body.notas !== undefined) updateData.notas = body.notas
        }

        const { data, error } = await supabase
            .from('jornadas')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            console.error('Error al actualizar jornada:', error)
            return NextResponse.json(
                { error: 'Error al actualizar jornada' },
                { status: 500 }
            )
        }

        // Crear evento correspondiente
        if (body.accion) {
            const tipoEventoMap: Record<string, string> = {
                pausar: 'pausa',
                reanudar: 'reanudacion',
                finalizar: 'finalizacion',
            }

            const tipoEvento = tipoEventoMap[body.accion]
            if (tipoEvento) {
                await supabase
                    .from('eventos_jornada')
                    .insert({
                        jornada_id: params.id,
                        tipo_evento: tipoEvento,
                        timestamp: ahora,
                        metadata: body.metadata || null,
                    })
            }
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error en PATCH /api/jornadas/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// DELETE /api/jornadas/[id] - Eliminar jornada
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

        // Verificar que la jornada pertenece al usuario
        const { data: jornadaExistente } = await supabase
            .from('jornadas')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single()

        if (!jornadaExistente) {
            return NextResponse.json(
                { error: 'Jornada no encontrada' },
                { status: 404 }
            )
        }

        const { error } = await supabase
            .from('jornadas')
            .delete()
            .eq('id', params.id)

        if (error) {
            console.error('Error al eliminar jornada:', error)
            return NextResponse.json(
                { error: 'Error al eliminar jornada' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Jornada eliminada correctamente' })
    } catch (error) {
        console.error('Error en DELETE /api/jornadas/[id]:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

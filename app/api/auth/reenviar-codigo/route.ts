import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/auth/reenviar-codigo - Reenviar código de verificación
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // Buscar el último código de verificación para este email para obtener el user_id
        const { data: lastCode, error: searchError } = await supabase
            .from('codigos_verificacion')
            .select('user_id')
            .eq('email', email.trim().toLowerCase())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (searchError) {
            console.error('Error al buscar código:', searchError)
            // Si la tabla no existe, dar un mensaje más claro
            if (searchError.code === 'PGRST116' || searchError.message?.includes('does not exist')) {
                return NextResponse.json(
                    { 
                        error: 'La tabla de códigos de verificación no existe. Por favor ejecuta el SQL de configuración primero.',
                        code: 'TABLE_NOT_FOUND'
                    },
                    { status: 500 }
                )
            }
            return NextResponse.json(
                { 
                    error: 'Error al buscar código',
                    details: searchError.message || 'Error desconocido'
                },
                { status: 500 }
            )
        }

        const userId = lastCode?.user_id || null

        if (!userId) {
            return NextResponse.json(
                { error: 'No se encontró un usuario con este email. Asegúrate de haber completado el registro primero.' },
                { status: 404 }
            )
        }

        // Generar nuevo código
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString()
        const expiraEn = new Date()
        expiraEn.setMinutes(expiraEn.getMinutes() + 15) // Expira en 15 minutos

        // Usar service role key si está disponible para evitar problemas de RLS
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseForInsert = supabaseServiceRoleKey 
            ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            })
            : supabase

        // Guardar nuevo código
        const { error: codigoError } = await supabaseForInsert
            .from('codigos_verificacion')
            .insert({
                user_id: userId,
                email: email.trim().toLowerCase(),
                codigo: codigoVerificacion,
                expira_en: expiraEn.toISOString(),
                usado: false,
            })

        if (codigoError) {
            console.error('Error al guardar código:', codigoError)
            return NextResponse.json(
                { 
                    error: 'Error al generar código',
                    details: codigoError.message || 'Error desconocido'
                },
                { status: 500 }
            )
        }

        // En producción, aquí enviarías el código por email
        // Por ahora, lo retornamos en la respuesta (solo para desarrollo)

        return NextResponse.json({
            message: 'Código reenviado exitosamente',
            codigo: codigoVerificacion, // Solo en desarrollo
            email: email.trim().toLowerCase(),
        })
    } catch (error: any) {
        console.error('Error en POST /api/auth/reenviar-codigo:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

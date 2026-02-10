import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/auth/verificar-codigo - Verificar código de verificación
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, codigo } = body

        if (!email || !codigo) {
            return NextResponse.json(
                { error: 'Email y código son requeridos' },
                { status: 400 }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        // Cliente anónimo para buscar el código
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // Buscar código de verificación válido
        const { data: codigoData, error: codigoError } = await supabase
            .from('codigos_verificacion')
            .select('*, user_id')
            .eq('email', email.trim().toLowerCase())
            .eq('codigo', codigo.trim())
            .eq('usado', false)
            .gt('expira_en', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (codigoError) {
            console.error('Error al buscar código:', codigoError)
            // Si la tabla no existe, dar un mensaje más claro
            if (codigoError.code === 'PGRST116' || codigoError.message?.includes('does not exist')) {
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
                    error: 'Error al verificar código',
                    details: codigoError.message || 'Error desconocido'
                },
                { status: 500 }
            )
        }

        if (!codigoData) {
            return NextResponse.json(
                { error: 'Código inválido o expirado' },
                { status: 400 }
            )
        }

        // Usar service role key para confirmar el email del usuario
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseServiceRoleKey) {
            try {
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                    },
                })

                // Obtener el usuario y sus metadata
                const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(codigoData.user_id)
                
                if (userError) {
                    console.error('Error al obtener usuario:', userError)
                    // Continuar aunque falle, el código ya está verificado
                } else if (userData?.user) {
                    // Confirmar el email del usuario
                    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                        codigoData.user_id,
                        {
                            email_confirm: true,
                        }
                    )

                    if (updateError) {
                        console.error('Error al confirmar email:', updateError)
                        // Continuar aunque falle la confirmación
                    }

                    // Asegurar que el perfil existe con los datos del metadata
                    const metadata = userData.user.user_metadata || {}
                    const nombre_completo = metadata.nombre_completo || 'Usuario'
                    const departamento = metadata.departamento || null
                    const cargo = metadata.cargo || null

                    // Crear o actualizar el perfil usando el cliente admin (bypass RLS)
                    const { error: perfilError } = await supabaseAdmin
                        .from('perfiles')
                        .upsert({
                            id: codigoData.user_id,
                            nombre_completo,
                            departamento,
                            cargo,
                            fecha_ingreso: new Date().toISOString().split('T')[0],
                        }, {
                            onConflict: 'id'
                        })

                    if (perfilError) {
                        console.warn('Error al crear/actualizar perfil:', perfilError)
                        // El trigger debería haber creado el perfil, así que esto es solo un fallback
                    }
                }
            } catch (adminError: any) {
                console.error('Error al usar admin API:', adminError)
                // Continuar aunque falle, el código ya está verificado
            }
        } else {
            console.warn('SUPABASE_SERVICE_ROLE_KEY no está configurado. El email no se confirmará automáticamente.')
        }

        // Marcar código como usado
        await supabase
            .from('codigos_verificacion')
            .update({ usado: true })
            .eq('id', codigoData.id)

        return NextResponse.json({
            message: 'Código verificado exitosamente',
            verified: true,
            userId: codigoData.user_id,
        })
    } catch (error: any) {
        console.error('Error en POST /api/auth/verificar-codigo:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

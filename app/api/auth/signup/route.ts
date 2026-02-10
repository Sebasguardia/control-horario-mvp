import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/auth/signup - Registrar nuevo usuario
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, nombre_completo, departamento, cargo } = body

        // Validación básica
        if (!email || !password || !nombre_completo) {
            return NextResponse.json(
                { error: 'Email, contraseña y nombre completo son requeridos' },
                { status: 400 }
            )
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim().toLowerCase())) {
            return NextResponse.json(
                { error: 'El formato del email no es válido' },
                { status: 400 }
            )
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Usar cliente de Supabase directamente (sin sesión) para crear usuarios
        // Esto evita problemas con RLS y sesiones
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // Crear usuario con metadata para el trigger
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: {
                    nombre_completo,
                    departamento: departamento || null,
                    cargo: cargo || null,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            },
        })

        if (authError) {
            console.error('Error al crear usuario:', authError)
            
            // Manejar errores específicos
            let errorMessage = authError.message || 'Error al crear usuario'
            let statusCode = 400
            
            const errorMsgLower = authError.message?.toLowerCase() || ''
            const errorStatus = (authError as any).status
            const errorCode = (authError as any).code || ''
            
            // Detectar rate limit por múltiples indicadores
            const isRateLimit = 
                errorStatus === 429 ||
                errorCode === 'over_email_send_rate_limit' ||
                errorCode === 'too_many_requests' ||
                errorMsgLower.includes('rate limit') ||
                errorMsgLower.includes('too many') ||
                errorMsgLower.includes('too_many') ||
                errorMsgLower.includes('exceeded') ||
                errorMsgLower.includes('quota')
            
            if (isRateLimit) {
                errorMessage = 'Demasiados intentos de registro. Por favor espera 10-15 minutos antes de intentar nuevamente.'
                statusCode = 429
            } else if (errorMsgLower.includes('already registered') || 
                       errorMsgLower.includes('already exists') || 
                       errorMsgLower.includes('user already registered') ||
                       errorCode === 'signup_disabled') {
                errorMessage = 'Este email ya está registrado. Por favor inicia sesión.'
            } else if (errorMsgLower.includes('invalid') || errorMsgLower.includes('malformed')) {
                errorMessage = 'El email o contraseña no son válidos. Verifica los datos e intenta nuevamente.'
            } else if (errorMsgLower.includes('password')) {
                errorMessage = 'La contraseña no cumple con los requisitos mínimos.'
            }
            
            return NextResponse.json(
                { 
                    error: errorMessage,
                    isRateLimit,
                    retryAfter: isRateLimit ? 600 : undefined, // 10 minutos en segundos
                },
                { status: statusCode }
            )
        }

        // Verificar si el usuario fue creado o si requiere confirmación de email
        if (!authData.user && !authData.session) {
            // En algunos casos, Supabase puede requerir confirmación de email
            // pero aún así retornar éxito
            return NextResponse.json(
                {
                    message: 'Usuario creado exitosamente. Por favor verifica tu email para activar tu cuenta.',
                    requiresEmailConfirmation: true,
                },
                { status: 201 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'No se pudo crear el usuario. Por favor intenta nuevamente.' },
                { status: 500 }
            )
        }

        // El perfil se creará automáticamente con el trigger usando los datos del metadata
        // También intentamos crearlo directamente como respaldo usando service role key
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseServiceRoleKey) {
            try {
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                    },
                })

                // Crear o actualizar el perfil directamente
                const { error: perfilError } = await supabaseAdmin
                    .from('perfiles')
                    .upsert({
                        id: authData.user.id,
                        nombre_completo,
                        departamento: departamento || null,
                        cargo: cargo || null,
                        fecha_ingreso: new Date().toISOString().split('T')[0],
                    }, {
                        onConflict: 'id'
                    })

                if (perfilError) {
                    console.warn('No se pudo crear perfil directamente (el trigger debería hacerlo):', perfilError.message)
                } else {
                    console.log('Perfil creado exitosamente para usuario:', authData.user.id)
                }
            } catch (perfilError: any) {
                console.warn('Error al crear perfil (no crítico, el trigger debería hacerlo):', perfilError?.message)
            }
        }

        return NextResponse.json(
            {
                message: 'Usuario creado exitosamente. Por favor verifica tu email para activar tu cuenta.',
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                },
                requiresEmailConfirmation: !authData.session, // Si no hay sesión, requiere confirmación
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error en POST /api/auth/signup:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

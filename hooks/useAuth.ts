'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Perfil, SignupCredentials, LoginCredentials } from '@/types/user.types'
import { toast } from 'sonner'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [perfil, setPerfil] = useState<Perfil | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Obtener sesión actual
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchPerfil(session.user.id)
                }
            } catch (error) {
                console.error('Error al obtener sesión:', error)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchPerfil(session.user.id)
                } else {
                    setPerfil(null)
                }

                if (event === 'SIGNED_OUT') {
                    router.push('/login')
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchPerfil = async (userId: string) => {
        try {
            // Usar la API en lugar de Supabase directo
            const response = await fetch('/api/perfiles')
            const result = await response.json()

            if (result.error) {
                // Si no hay perfil, no es un error crítico
                if (response.status === 404 || response.status === 401) {
                    setPerfil(null)
                    return
                }
                throw new Error(result.error)
            }

            setPerfil(result.data)
        } catch (error) {
            console.error('Error al obtener perfil:', error)
            // Intentar con Supabase como fallback
            try {
                const { data, error: supabaseError } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle()

                if (!supabaseError && data) {
                    setPerfil(data)
                }
            } catch (fallbackError) {
                console.error('Error en fallback de perfil:', fallbackError)
            }
        }
    }

    const signUp = async (credentials: SignupCredentials) => {
        try {
            setLoading(true)

            // Usar la API de signup
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    nombre_completo: credentials.nombre_completo,
                    departamento: credentials.departamento,
                    cargo: credentials.cargo,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // Manejar errores específicos
                let errorMessage = result.error || 'Error al crear cuenta'
                let errorType: 'rate_limit' | 'already_exists' | 'validation' | 'other' = 'other'
                
                // Detectar rate limit por múltiples indicadores
                const isRateLimit = 
                    response.status === 429 ||
                    result.isRateLimit === true ||
                    result.error?.toLowerCase().includes('rate limit') ||
                    result.error?.toLowerCase().includes('demasiados intentos') ||
                    result.error?.toLowerCase().includes('too many')
                
                if (isRateLimit) {
                    const retryAfter = result.retryAfter || 600 // 10 minutos por defecto
                    errorMessage = `Demasiados intentos de registro. Por favor espera ${Math.ceil(retryAfter / 60)} minutos antes de intentar nuevamente.`
                    errorType = 'rate_limit'
                } else if (result.error?.toLowerCase().includes('already registered') || 
                          result.error?.toLowerCase().includes('already exists') || 
                          result.error?.toLowerCase().includes('ya está registrado')) {
                    errorMessage = 'Este email ya está registrado. Por favor inicia sesión en su lugar.'
                    errorType = 'already_exists'
                    router.push('/login')
                } else if (result.error?.toLowerCase().includes('invalid') || 
                          result.error?.toLowerCase().includes('válido') || 
                          result.error?.toLowerCase().includes('formato')) {
                    errorType = 'validation'
                }
                
                // Mostrar toast de error antes de lanzar la excepción
                if (errorType === 'rate_limit') {
                    toast.error('Límite de intentos excedido', {
                        description: `Has intentado registrarte muchas veces. Por favor espera ${Math.ceil((result.retryAfter || 600) / 60)} minutos antes de intentar nuevamente.`,
                        duration: 8000,
                    })
                } else if (errorType === 'already_exists') {
                    toast.error('Email ya registrado', {
                        description: 'Este email ya tiene una cuenta. Por favor inicia sesión.',
                        duration: 5000,
                    })
                } else {
                    toast.error('Error al crear cuenta', {
                        description: errorMessage,
                        duration: 5000,
                    })
                }
                
                throw new Error(errorMessage)
            }

            // Si requiere confirmación de email, no intentar hacer sign in
            if (result.requiresEmailConfirmation) {
                toast.success('Cuenta creada exitosamente', {
                    description: 'Por favor verifica tu email para activar tu cuenta.',
                    duration: 6000,
                })
                router.push('/login')
                return { success: true, requiresEmailConfirmation: true }
            }

            // Intentar crear el perfil usando la API si el trigger no lo hizo
            // Esperamos un momento para que el trigger se ejecute
            await new Promise(resolve => setTimeout(resolve, 500))

            // Intentar hacer sign in solo si no requiere confirmación
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password,
            })

            if (signInError) {
                // Si hay error de sign in, puede ser que requiera confirmación de email
                if (signInError.message?.includes('email') || signInError.message?.includes('confirm')) {
                    toast.success('Cuenta creada. Por favor verifica tu email para iniciar sesión.')
                    router.push('/login')
                    return { success: true, requiresEmailConfirmation: true }
                }
                // Otro tipo de error
                throw signInError
            }

            // Si el sign in fue exitoso, verificar y crear perfil si es necesario
            if (signInData.user) {
                // Intentar obtener el perfil
                await fetchPerfil(signInData.user.id)

                // Si no hay perfil, intentar crearlo usando la API
                if (!perfil) {
                    try {
                        const perfilResponse = await fetch('/api/perfiles', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                nombre_completo: credentials.nombre_completo,
                                departamento: credentials.departamento,
                                cargo: credentials.cargo,
                            }),
                        })

                        if (perfilResponse.ok) {
                            await fetchPerfil(signInData.user.id)
                        }
                    } catch (perfilError) {
                        console.warn('No se pudo crear perfil automáticamente:', perfilError)
                        // El usuario puede crear su perfil después
                    }
                }

                toast.success('Cuenta creada exitosamente')
                router.push('/dashboard')
                return { success: true }
            }

            return { success: false, error: 'No se pudo iniciar sesión' }
        } catch (error: any) {
            console.error('Error en signUp:', error)
            const errorMessage = error.message || 'Error al crear cuenta'
            
            // Solo mostrar toast si no se mostró uno específico antes
            // (los errores específicos ya muestran su propio toast)
            if (!errorMessage.includes('Demasiados intentos') && 
                !errorMessage.includes('ya está registrado') &&
                !errorMessage.includes('ya tiene una cuenta')) {
                toast.error('Error al crear cuenta', {
                    description: errorMessage,
                    duration: 5000,
                })
            }
            
            // Retornar el error para que el componente pueda manejarlo
            return { 
                success: false, 
                error: errorMessage,
                isRateLimit: errorMessage.includes('Demasiados intentos') || errorMessage.includes('rate limit')
            }
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (credentials: LoginCredentials) => {
        try {
            setLoading(true)

            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password,
            })

            if (error) {
                // Manejar error de email no confirmado
                if (error.message?.toLowerCase().includes('email not confirmed') || 
                    error.message?.toLowerCase().includes('email_not_confirmed')) {
                    throw { ...error, requiresEmailConfirmation: true }
                }
                throw error
            }

            // Sincronizar perfil con los datos de metadata del usuario
            if (data.user) {
                try {
                    const metadata = (data.user as any).user_metadata || {}
                    const updates: Partial<Perfil> = {}

                    if (metadata.nombre_completo) {
                        updates.nombre_completo = metadata.nombre_completo
                    }
                    if (metadata.departamento) {
                        updates.departamento = metadata.departamento
                    }
                    if (metadata.cargo) {
                        updates.cargo = metadata.cargo
                    }

                    // Solo llamar a la API si tenemos algo que actualizar
                    if (Object.keys(updates).length > 0) {
                        await fetch('/api/perfiles', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updates),
                        })
                    }
                } catch (perfilSyncError) {
                    console.warn('No se pudo sincronizar el perfil desde metadata:', perfilSyncError)
                }

                // Obtener el perfil actualizado después del login exitoso
                await fetchPerfil(data.user.id)
            }

            toast.success('¡Bienvenido!')
            router.push('/dashboard')
            return { success: true }
        } catch (error: any) {
            console.error('Error en signIn:', error)
            
            const errorMessage = error.message || 'Credenciales inválidas'
            
            // Manejar error de email no confirmado
            if (error.requiresEmailConfirmation || 
                errorMessage.toLowerCase().includes('email not confirmed') ||
                errorMessage.toLowerCase().includes('email_not_confirmed')) {
                toast.error('Email no confirmado', {
                    description: 'Por favor verifica tu email antes de iniciar sesión. Puedes reenviar el email de confirmación.',
                    duration: 6000,
                })
                return { 
                    success: false, 
                    error: errorMessage,
                    requiresEmailConfirmation: true,
                    email: credentials.email
                }
            }
            
            toast.error('Error al iniciar sesión', {
                description: errorMessage,
                duration: 5000,
            })
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const resendConfirmationEmail = async (email: string) => {
        try {
            setLoading(true)
            
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email.trim().toLowerCase(),
            })

            if (error) throw error

            toast.success('Email de confirmación enviado', {
                description: 'Revisa tu bandeja de entrada y haz clic en el enlace para confirmar tu cuenta.',
                duration: 6000,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error al reenviar email:', error)
            toast.error('Error al reenviar email', {
                description: error.message || 'No se pudo reenviar el email de confirmación',
                duration: 5000,
            })
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            toast.success('Sesión cerrada')
            router.push('/login')
            return { success: true }
        } catch (error: any) {
            console.error('Error en signOut:', error)
            toast.error(error.message || 'Error al cerrar sesión')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const updatePerfil = async (updates: Partial<Perfil>) => {
        if (!user) return { success: false, error: 'No hay usuario autenticado' }

        try {
            setLoading(true)

            // Usar la API de perfiles
            const response = await fetch('/api/perfiles', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al actualizar perfil')
            }

            setPerfil(result.data)
            toast.success('Perfil actualizado')
            return { success: true, data: result.data }
        } catch (error: any) {
            console.error('Error al actualizar perfil:', error)
            toast.error(error.message || 'Error al actualizar perfil')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const changePassword = async (newPassword: string) => {
        try {
            setLoading(true)

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) throw error

            toast.success('Contraseña actualizada')
            return { success: true }
        } catch (error: any) {
            console.error('Error al cambiar contraseña:', error)
            toast.error(error.message || 'Error al cambiar contraseña')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        perfil,
        loading,
        signUp,
        signIn,
        signOut,
        updatePerfil,
        changePassword,
        resendConfirmationEmail,
        refreshPerfil: () => user && fetchPerfil(user.id),
    }
}
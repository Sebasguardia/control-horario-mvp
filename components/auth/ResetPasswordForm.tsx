'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/utils/validators'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordReset, setPasswordReset] = useState(false)
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    // Verificar si hay un token válido en la URL
    useEffect(() => {
        const checkToken = async () => {
            try {
                // Supabase maneja automáticamente el token del hash cuando el usuario viene del email
                // Verificamos si hay una sesión activa o si el token está en la URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const type = hashParams.get('type')

                if (accessToken && type === 'recovery') {
                    // Intentar establecer la sesión con el token
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: hashParams.get('refresh_token') || '',
                    })

                    if (error) {
                        console.error('Error al establecer sesión:', error)
                        setIsValidToken(false)
                        toast.error('Token inválido o expirado', {
                            description: 'El enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.',
                            duration: 6000,
                        })
                    } else {
                        setIsValidToken(true)
                    }
                } else {
                    // Verificar si ya hay una sesión activa (usuario ya autenticado)
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session) {
                        setIsValidToken(true)
                    } else {
                        setIsValidToken(false)
                        toast.error('Token no encontrado', {
                            description: 'No se encontró un token válido. Por favor solicita un nuevo enlace de recuperación.',
                            duration: 6000,
                        })
                    }
                }
            } catch (error) {
                console.error('Error al verificar token:', error)
                setIsValidToken(false)
            }
        }

        checkToken()
    }, [supabase])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!isValidToken) {
            toast.error('Token inválido', {
                description: 'Por favor solicita un nuevo enlace de recuperación.',
                duration: 5000,
            })
            return
        }

        try {
            setLoading(true)

            // Actualizar la contraseña del usuario autenticado
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            })

            if (error) throw error

            setPasswordReset(true)
            toast.success('Contraseña restablecida', {
                description: 'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.',
                duration: 5000,
            })

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (error: any) {
            console.error('Error al restablecer contraseña:', error)
            toast.error('Error al restablecer contraseña', {
                description: error.message || 'No se pudo restablecer la contraseña. Por favor intenta nuevamente.',
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    // Mostrar mensaje de éxito
    if (passwordReset) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Contraseña restablecida</h3>
                            <p className="text-sm text-muted-foreground">
                                Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
                            </p>
                            <Link href="/login">
                                <Button className="mt-4">
                                    Ir al login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    // Mostrar error si el token no es válido
    if (isValidToken === false) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Token inválido o expirado</h3>
                            <p className="text-sm text-muted-foreground">
                                El enlace de recuperación no es válido o ha expirado. Por favor solicita un nuevo enlace.
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Link href="/forgot-password">
                                    <Button>
                                        Solicitar nuevo enlace
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline">
                                        Volver al login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    // Mostrar formulario de carga mientras se verifica el token
    if (isValidToken === null) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">
                                Verificando enlace de recuperación...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    // Mostrar formulario de reset password
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Restablecer Contraseña</CardTitle>
                    <CardDescription>
                        Ingresa tu nueva contraseña
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Nueva Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10"
                                    {...register('password')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10"
                                    {...register('confirmPassword')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading || !isValidToken}>
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center">
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al login
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}

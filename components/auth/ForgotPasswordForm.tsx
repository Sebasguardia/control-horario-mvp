'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [rateLimitError, setRateLimitError] = useState(false)
    const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null)
    const supabase = createClient()

    // Contador regresivo para rate limit
    useEffect(() => {
        if (rateLimitCooldown && rateLimitCooldown > 0) {
            const timer = setInterval(() => {
                setRateLimitCooldown((prev) => {
                    if (prev === null || prev <= 1) {
                        setRateLimitError(false)
                        return null
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [rateLimitCooldown])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        // Limpiar errores previos
        setRateLimitError(false)
        setRateLimitCooldown(null)

        try {
            setLoading(true)

            const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim().toLowerCase(), {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                // Manejar error de rate limit - verificar múltiples formas
                const errorMsg = error.message?.toLowerCase() || ''
                const errorCode = error.code?.toLowerCase() || ''
                const isRateLimit = 
                    error.status === 429 ||
                    errorCode === 'over_email_send_rate_limit' ||
                    errorCode.includes('rate_limit') ||
                    errorCode.includes('over_email_send_rate_limit') ||
                    errorMsg.includes('rate limit') || 
                    errorMsg.includes('too many requests') ||
                    errorMsg.includes('too many') ||
                    error.isRateLimit === true

                if (isRateLimit) {
                    setRateLimitError(true)
                    setRateLimitCooldown(600) // 10 minutos
                    toast.error('Límite de intentos excedido', {
                        description: 'Has solicitado demasiados emails de recuperación. Por favor espera unos minutos antes de intentar nuevamente.',
                        duration: 6000,
                    })
                    // No lanzar el error, solo retornar para que se muestre la UI
                    return
                }
                throw error
            }

            // Limpiar errores si el envío fue exitoso
            setRateLimitError(false)
            setRateLimitCooldown(null)

            setEmailSent(true)
            toast.success('Email enviado', {
                description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                duration: 5000,
            })
        } catch (error: any) {
            // Verificar si es rate limit también en el catch (por si no se detectó antes)
            const errorMsg = error.message?.toLowerCase() || ''
            const errorCode = error.code?.toLowerCase() || ''
            const isRateLimitError = 
                error.isRateLimit === true ||
                error.status === 429 ||
                errorCode === 'over_email_send_rate_limit' ||
                errorCode.includes('rate_limit') ||
                errorCode.includes('over_email_send_rate_limit') ||
                errorMsg.includes('rate limit') || 
                errorMsg.includes('too many requests') ||
                errorMsg.includes('too many')
            
            if (isRateLimitError) {
                // Configurar estado visual para rate limit
                setRateLimitError(true)
                setRateLimitCooldown(600)
                // Mostrar toast si no se mostró antes
                if (!rateLimitError) {
                    toast.error('Límite de intentos excedido', {
                        description: 'Has solicitado demasiados emails de recuperación. Por favor espera unos minutos antes de intentar nuevamente.',
                        duration: 6000,
                    })
                }
            } else {
                // Solo mostrar toast genérico si no es rate limit
                console.error('Error:', error)
                toast.error('Error al enviar email', {
                    description: error.message || 'No se pudo enviar el email de recuperación. Verifica el email e intenta nuevamente.',
                    duration: 5000,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
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
                            <h3 className="text-xl font-semibold">Email enviado</h3>
                            <p className="text-sm text-muted-foreground">
                                Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.
                            </p>
                            <Link href="/login">
                                <Button variant="outline" className="mt-4">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
                    <CardDescription>
                        Ingresa tu email y te enviaremos instrucciones para recuperar tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Rate Limit Alert */}
                        {rateLimitError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                            Límite de intentos excedido
                                        </p>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            Has solicitado demasiados emails de recuperación.
                                        </p>
                                        {rateLimitCooldown && rateLimitCooldown > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                                                <Clock className="h-4 w-4" />
                                                <span>Puedes intentar nuevamente en: {formatTime(rateLimitCooldown)}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                            💡 <strong>Tip:</strong> Espera unos minutos o contacta al administrador si necesitas ayuda urgente.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="pl-10"
                                    {...register('email')}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                        >
                            {loading 
                                ? 'Enviando...' 
                                : rateLimitCooldown && rateLimitCooldown > 0
                                ? `Espera ${formatTime(rateLimitCooldown)}`
                                : 'Enviar instrucciones'
                            }
                        </Button>

                        <Link href="/login">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al login
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/utils/validators'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Eye, EyeOff, AlertCircle, MailCheck } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [emailNotConfirmed, setEmailNotConfirmed] = useState<string | null>(null)
    const [emailResent, setEmailResent] = useState(false)
    const { signIn, resendConfirmationEmail, loading } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        // Limpiar estados previos
        setEmailNotConfirmed(null)
        setEmailResent(false)

        const result = await signIn(data)

        // Si requiere confirmación de email, mostrar opción de reenviar
        if (!result.success && result.requiresEmailConfirmation) {
            setEmailNotConfirmed(result.email || data.email)
        }
    }

    const handleResendEmail = async () => {
        if (!emailNotConfirmed) return
        
        const result = await resendConfirmationEmail(emailNotConfirmed)
        if (result.success) {
            setEmailResent(true)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email Not Confirmed Alert */}
                        {emailNotConfirmed && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                            Email no confirmado
                                        </p>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            Necesitas verificar tu email antes de poder iniciar sesión.
                                        </p>
                                        {emailResent ? (
                                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                <MailCheck className="h-4 w-4" />
                                                <span>Email reenviado. Revisa tu bandeja de entrada.</span>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResendEmail}
                                                disabled={loading}
                                                className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
                                            >
                                                <Mail className="h-4 w-4 mr-2" />
                                                Reenviar email de confirmación
                                            </Button>
                                        )}
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                            💡 <strong>Tip:</strong> Revisa tu carpeta de spam si no encuentras el email.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Email */}
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

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
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

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </Button>

                        {/* Signup Link */}
                        <div className="text-center text-sm">
                            ¿No tienes cuenta?{' '}
                            <Link href="/signup" className="text-primary hover:underline font-medium">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}
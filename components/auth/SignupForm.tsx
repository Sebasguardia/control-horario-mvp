'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/utils/validators'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Briefcase, Building2, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function SignupForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [rateLimitError, setRateLimitError] = useState<string | null>(null)
    const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(null)
    const { signUp, loading } = useAuth()

    // Contador regresivo para rate limit
    useEffect(() => {
        if (rateLimitCooldown && rateLimitCooldown > 0) {
            const timer = setInterval(() => {
                setRateLimitCooldown((prev) => {
                    if (prev === null || prev <= 1) {
                        setRateLimitError(null)
                        return null
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [rateLimitCooldown])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    })

    const onSubmit = async (data: SignupFormData) => {
        // Limpiar errores previos
        setRateLimitError(null)
        setRateLimitCooldown(null)

        try {
            const result = await signUp(data)

            // Si hay error de rate limit, mostrar mensaje y establecer cooldown
            if (!result.success && result.error) {
                const isRateLimit = 
                    result.error.toLowerCase().includes('demasiados intentos') ||
                    result.error.toLowerCase().includes('rate limit') ||
                    result.error.toLowerCase().includes('too many')
                
                if (isRateLimit) {
                    setRateLimitError(result.error)
                    // Establecer cooldown de 10 minutos (600 segundos) por defecto
                    // O usar el tiempo específico si está disponible
                    setRateLimitCooldown(600)
                }
            }
        } catch (error: any) {
            // Capturar errores de rate limit que se lanzan como excepciones
            const errorMessage = error?.message || ''
            const isRateLimit = 
                errorMessage.toLowerCase().includes('demasiados intentos') ||
                errorMessage.toLowerCase().includes('rate limit') ||
                errorMessage.toLowerCase().includes('too many')
            
            if (isRateLimit) {
                setRateLimitError(errorMessage)
                setRateLimitCooldown(600) // 10 minutos
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Completa tus datos para registrarte en el sistema
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
                                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                            Límite de intentos excedido
                                        </p>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            {rateLimitError}
                                        </p>
                                        {rateLimitCooldown && rateLimitCooldown > 0 && (
                                            <div className="flex items-center gap-2 mt-2 text-sm text-orange-600 dark:text-orange-400">
                                                <Clock className="h-4 w-4" />
                                                <span>Puedes intentar nuevamente en: {formatTime(rateLimitCooldown)}</span>
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                                                💡 Soluciones rápidas:
                                            </p>
                                            <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1 ml-4 list-disc">
                                                <li><strong>Opción rápida:</strong> Usa un email diferente (ej: test2@example.com)</li>
                                                <li><strong>O espera:</strong> El contador arriba muestra cuándo puedes intentar de nuevo</li>
                                                <li><strong>Para desarrollo:</strong> Desactiva rate limit en Supabase Dashboard → Authentication → Settings</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Nombre Completo */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_completo">Nombre Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="nombre_completo"
                                    type="text"
                                    placeholder="Juan Pérez"
                                    className="pl-10"
                                    {...register('nombre_completo')}
                                    disabled={loading}
                                />
                            </div>
                            {errors.nombre_completo && (
                                <p className="text-sm text-destructive">{errors.nombre_completo.message}</p>
                            )}
                        </div>

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

                        {/* Departamento y Cargo en grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Departamento */}
                            <div className="space-y-2">
                                <Label htmlFor="departamento">Departamento</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="departamento"
                                        type="text"
                                        placeholder="TI"
                                        className="pl-10"
                                        {...register('departamento')}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.departamento && (
                                    <p className="text-sm text-destructive">{errors.departamento.message}</p>
                                )}
                            </div>

                            {/* Cargo */}
                            <div className="space-y-2">
                                <Label htmlFor="cargo">Cargo</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cargo"
                                        type="text"
                                        placeholder="Developer"
                                        className="pl-10"
                                        {...register('cargo')}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.cargo && (
                                    <p className="text-sm text-destructive">{errors.cargo.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
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
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || (rateLimitCooldown !== null && rateLimitCooldown > 0)}
                        >
                            {loading 
                                ? 'Creando cuenta...' 
                                : rateLimitCooldown && rateLimitCooldown > 0
                                ? `Espera ${formatTime(rateLimitCooldown)}`
                                : 'Crear Cuenta'
                            }
                        </Button>

                        {/* Login Link */}
                        <div className="text-center text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Inicia sesión
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}
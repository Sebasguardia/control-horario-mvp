'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const verifyCodeSchema = z.object({
    email: z.string().email('Email inválido'),
    codigo: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'El código debe contener solo números'),
})

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>

export function VerifyCodeForm() {
    const [loading, setLoading] = useState(false)
    const [verified, setVerified] = useState(false)
    const [resending, setResending] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const emailFromQuery = searchParams.get('email') || ''

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<VerifyCodeFormData>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            email: emailFromQuery,
            codigo: '',
        },
    })

    const codigoValue = watch('codigo')

    // Auto-avanzar entre inputs del código
    const handleCodeChange = (value: string, index: number) => {
        const digits = value.replace(/\D/g, '').slice(0, 1)
        if (digits && index < 5) {
            const nextInput = document.getElementById(`codigo-${index + 1}`)
            nextInput?.focus()
        }
    }

    // Manejar paste en el primer input
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pastedData.length === 6) {
            setValue('codigo', pastedData)
            document.getElementById('codigo-5')?.focus()
        }
    }

    useEffect(() => {
        if (emailFromQuery) {
            setValue('email', emailFromQuery)
        }
        
        // Si hay un código en la URL (desarrollo), establecerlo
        const codigoFromQuery = searchParams.get('codigo')
        if (codigoFromQuery && codigoFromQuery.length === 6) {
            setValue('codigo', codigoFromQuery)
        }
    }, [emailFromQuery, searchParams, setValue])

    const onSubmit = async (data: VerifyCodeFormData) => {
        try {
            setLoading(true)

            const response = await fetch('/api/auth/verificar-codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email.trim().toLowerCase(),
                    codigo: data.codigo.trim(),
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // Mensaje más específico según el tipo de error
                let errorMessage = result.error || 'Código inválido'
                
                if (result.code === 'TABLE_NOT_FOUND') {
                    errorMessage = 'La tabla de códigos no existe. Por favor ejecuta el SQL de configuración en Supabase.'
                } else if (result.details) {
                    errorMessage = `${errorMessage}: ${result.details}`
                }
                
                throw new Error(errorMessage)
            }

            setVerified(true)
            toast.success('Código verificado exitosamente', {
                description: 'Tu cuenta ha sido verificada. Ahora puedes iniciar sesión.',
                duration: 5000,
            })

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                router.push(`/login?email=${encodeURIComponent(data.email)}`)
            }, 2000)
        } catch (error: any) {
            console.error('Error al verificar código:', error)
            toast.error('Error al verificar código', {
                description: error.message || 'El código no es válido o ha expirado. Por favor intenta nuevamente.',
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        const email = watch('email')
        if (!email) {
            toast.error('Por favor ingresa tu email primero')
            return
        }

        try {
            setResending(true)
            
            const response = await fetch('/api/auth/reenviar-codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // Mensaje más específico según el tipo de error
                let errorMessage = result.error || 'Error al reenviar código'
                
                if (result.code === 'TABLE_NOT_FOUND') {
                    errorMessage = 'La tabla de códigos no existe. Por favor ejecuta el SQL de configuración en Supabase.'
                } else if (result.details) {
                    errorMessage = `${errorMessage}: ${result.details}`
                }
                
                throw new Error(errorMessage)
            }

            toast.success('Código reenviado', {
                description: result.codigo 
                    ? `Tu nuevo código es: ${result.codigo}` 
                    : 'Revisa tu email para el nuevo código de verificación.',
                duration: 10000,
            })

            // Si recibimos el código, actualizar el formulario
            if (result.codigo) {
                setValue('codigo', result.codigo)
            }
        } catch (error: any) {
            toast.error('Error al reenviar código', {
                description: error.message || 'No se pudo reenviar el código.',
                duration: 5000,
            })
        } finally {
            setResending(false)
        }
    }

    if (verified) {
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
                            <h3 className="text-xl font-semibold">Cuenta verificada</h3>
                            <p className="text-sm text-muted-foreground">
                                Tu cuenta ha sido verificada exitosamente. Serás redirigido al login en unos segundos.
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verificar Código</CardTitle>
                    <CardDescription>
                        Ingresa el código de 6 dígitos que recibiste para verificar tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    disabled={loading || !!emailFromQuery}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Código de 6 dígitos */}
                        <div className="space-y-2">
                            <Label>Código de Verificación</Label>
                            <div className="flex gap-2 justify-center">
                                {[0, 1, 2, 3, 4, 5].map((index) => {
                                    const digitValue = codigoValue?.[index] || ''
                                    return (
                                        <Input
                                            key={index}
                                            id={`codigo-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="w-12 h-12 text-center text-lg font-semibold"
                                            value={digitValue}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 1)
                                                const newCode = (codigoValue || '').split('')
                                                newCode[index] = value
                                                const fullCode = newCode.join('').slice(0, 6)
                                                setValue('codigo', fullCode, { shouldValidate: true })
                                                if (value && index < 5) {
                                                    const nextInput = document.getElementById(`codigo-${index + 1}`)
                                                    nextInput?.focus()
                                                }
                                            }}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !digitValue && index > 0) {
                                                    const prevInput = document.getElementById(`codigo-${index - 1}`)
                                                    prevInput?.focus()
                                                }
                                            }}
                                            disabled={loading}
                                        />
                                    )
                                })}
                            </div>
                            <input
                                type="hidden"
                                {...register('codigo')}
                            />
                            {errors.codigo && (
                                <p className="text-sm text-destructive text-center">{errors.codigo.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground text-center">
                                Ingresa el código de 6 dígitos
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading || codigoValue.length !== 6}>
                            {loading ? 'Verificando...' : 'Verificar Código'}
                        </Button>

                        {/* Resend Code */}
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResendCode}
                                disabled={resending || loading}
                                className="text-sm"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                                Reenviar código
                            </Button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center pt-4 border-t">
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

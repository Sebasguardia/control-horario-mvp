'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updatePerfilSchema, changePasswordSchema, type UpdatePerfilFormData, type ChangePasswordFormData } from '@/lib/utils/validators'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
    User, 
    Edit2, 
    Save, 
    X, 
    Mail, 
    Building2, 
    Briefcase, 
    Clock, 
    Calendar,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PerfilPage() {
    const { user, perfil, updatePerfil, changePassword, loading: authLoading } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<UpdatePerfilFormData>({
        resolver: zodResolver(updatePerfilSchema),
        defaultValues: {
            nombre_completo: perfil?.nombre_completo || '',
            departamento: perfil?.departamento || '',
            cargo: perfil?.cargo || '',
            hora_inicio_default: perfil?.hora_inicio_default || '',
        },
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    })

    // Actualizar valores del formulario cuando cambia el perfil
    useEffect(() => {
        if (perfil) {
            reset({
                nombre_completo: perfil.nombre_completo || '',
                departamento: perfil.departamento || '',
                cargo: perfil.cargo || '',
                hora_inicio_default: perfil.hora_inicio_default || '',
            })
        }
    }, [perfil, reset])

    const onSubmit = async (data: UpdatePerfilFormData) => {
        const result = await updatePerfil(data)
        if (result.success) {
            setIsEditing(false)
        }
    }

    const onPasswordSubmit = async (data: ChangePasswordFormData) => {
        const result = await changePassword(data.newPassword)
        if (result.success) {
            setIsChangingPassword(false)
            resetPassword()
        }
    }

    const handleCancel = () => {
        reset({
            nombre_completo: perfil?.nombre_completo || '',
            departamento: perfil?.departamento || '',
            cargo: perfil?.cargo || '',
            hora_inicio_default: perfil?.hora_inicio_default || '',
        })
        setIsEditing(false)
    }

    const getInitials = (name: string | null) => {
        if (!name) return 'U'
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header del Perfil */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={perfil?.avatar_url || undefined} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(perfil?.nombre_completo || null)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {perfil?.nombre_completo || 'Usuario'}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4" />
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar Perfil
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Información del Perfil */}
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                        {isEditing ? 'Modifica tu información personal' : 'Tu información de perfil'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_completo">Nombre Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="nombre_completo"
                                            className="pl-10"
                                            {...register('nombre_completo')}
                                        />
                                    </div>
                                    {errors.nombre_completo && (
                                        <p className="text-sm text-destructive">{errors.nombre_completo.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departamento">Departamento</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="departamento"
                                            className="pl-10"
                                            {...register('departamento')}
                                        />
                                    </div>
                                    {errors.departamento && (
                                        <p className="text-sm text-destructive">{errors.departamento.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cargo">Cargo</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="cargo"
                                            className="pl-10"
                                            {...register('cargo')}
                                        />
                                    </div>
                                    {errors.cargo && (
                                        <p className="text-sm text-destructive">{errors.cargo.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hora_inicio_default">Hora de Inicio por Defecto</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="hora_inicio_default"
                                            type="time"
                                            className="pl-10"
                                            {...register('hora_inicio_default')}
                                        />
                                    </div>
                                    {errors.hora_inicio_default && (
                                        <p className="text-sm text-destructive">{errors.hora_inicio_default.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                                        <p className="text-base">{perfil?.nombre_completo || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                                        <p className="text-base">{perfil?.departamento || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                                        <p className="text-base">{perfil?.cargo || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Hora de Inicio por Defecto</p>
                                        <p className="text-base">{perfil?.hora_inicio_default || 'No especificada'}</p>
                                    </div>
                                </div>

                                {perfil?.fecha_ingreso && (
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</p>
                                            <p className="text-base">
                                                {format(new Date(perfil.fecha_ingreso), 'dd/MM/yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cambiar Contraseña */}
            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>
                        {isChangingPassword ? 'Actualiza tu contraseña' : 'Gestiona la seguridad de tu cuenta'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isChangingPassword ? (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        {...registerPassword('currentPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        {...registerPassword('newPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        {...registerPassword('confirmPassword')}
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
                                {passwordErrors.confirmPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Actualizar Contraseña
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        resetPassword()
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Para mantener tu cuenta segura, usa una contraseña única y no la compartas con nadie.
                            </p>
                            <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                                <Lock className="h-4 w-4 mr-2" />
                                Cambiar Contraseña
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

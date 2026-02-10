import { z } from 'zod'

// Schema de validación para Login
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña es demasiado larga'),
})

// Schema de validación para Signup
export const signupSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z
        .string()
        .min(1, 'Confirma tu contraseña'),
    nombre_completo: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre es demasiado largo')
        .trim(),
    departamento: z
        .string()
        .max(50, 'El departamento es demasiado largo')
        .optional(),
    cargo: z
        .string()
        .max(50, 'El cargo es demasiado largo')
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

// Schema de validación para reset password
export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z
        .string()
        .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

// Schema de validación para actualizar perfil
export const updatePerfilSchema = z.object({
    nombre_completo: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre es demasiado largo')
        .trim()
        .optional(),
    departamento: z
        .string()
        .max(50, 'El departamento es demasiado largo')
        .optional(),
    cargo: z
        .string()
        .max(50, 'El cargo es demasiado largo')
        .optional(),
    avatar_url: z
        .string()
        .url('URL inválida')
        .optional()
        .or(z.literal('')),
    hora_inicio_default: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .optional(),
})

// Schema de validación para cambiar contraseña
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'La contraseña actual es requerida'),
    newPassword: z
        .string()
        .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z
        .string()
        .min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

// Schema de validación para notas de jornada
export const jornadaNotasSchema = z.object({
    notas: z
        .string()
        .max(500, 'Las notas no pueden exceder 500 caracteres')
        .optional(),
})

// Validar email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validar rango de fechas
export function isValidDateRange(desde: Date, hasta: Date): boolean {
    return desde <= hasta
}

// Tipos exportados
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePerfilFormData = z.infer<typeof updatePerfilSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type JornadaNotasFormData = z.infer<typeof jornadaNotasSchema>

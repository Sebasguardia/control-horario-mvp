export interface User {
    id: string
    email: string
    created_at: string
}

export interface Perfil {
    id: string
    nombre_completo: string | null
    departamento: string | null
    cargo: string | null
    avatar_url: string | null
    fecha_ingreso: string | null
    hora_inicio_default: string | null
    created_at: string
    updated_at: string
}

export interface UserWithPerfil {
    user: User
    perfil: Perfil | null
}

export interface AuthError {
    message: string
    status?: number
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface SignupCredentials {
    email: string
    password: string
    nombre_completo: string
    departamento?: string
    cargo?: string
}

export interface UpdatePerfilData {
    nombre_completo?: string
    departamento?: string
    cargo?: string
    avatar_url?: string
    hora_inicio_default?: string
}
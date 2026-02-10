import type { Perfil } from '@/types/user.types'

const API_BASE = '/api'

interface ApiResponse<T> {
    data?: T
    error?: string
}

async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        const json = await response.json()

        if (!response.ok) {
            return { error: json.error || 'Error en la petición' }
        }

        return json
    } catch (error) {
        console.error(`Error en ${endpoint}:`, error)
        return { error: 'Error de conexión' }
    }
}

export const perfilesApi = {
    // Obtener perfil del usuario actual
    async get(): Promise<ApiResponse<Perfil>> {
        return fetchApi<Perfil>('/perfiles')
    },

    // Actualizar perfil
    async update(data: {
        nombre_completo?: string
        departamento?: string
        cargo?: string
        avatar_url?: string
        fecha_ingreso?: string
        hora_inicio_default?: string
    }): Promise<ApiResponse<Perfil>> {
        return fetchApi<Perfil>('/perfiles', {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },
}

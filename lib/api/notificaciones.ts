import type { Notificacion } from '@/types/notificaciones.types'

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

export const notificacionesApi = {
    // Obtener notificaciones
    async getAll(params?: {
        no_leidas?: boolean
        limit?: number
    }): Promise<ApiResponse<Notificacion[]>> {
        const searchParams = new URLSearchParams()
        if (params?.no_leidas) searchParams.append('no_leidas', 'true')
        if (params?.limit) searchParams.append('limit', params.limit.toString())

        const query = searchParams.toString()
        return fetchApi<Notificacion[]>(`/notificaciones${query ? `?${query}` : ''}`)
    },

    // Obtener notificaciones no leídas
    async getNoLeidas(limit?: number): Promise<ApiResponse<Notificacion[]>> {
        return this.getAll({ no_leidas: true, limit })
    },

    // Crear notificación
    async create(data: {
        user_id?: string
        tipo: string
        titulo: string
        mensaje?: string
    }): Promise<ApiResponse<Notificacion>> {
        return fetchApi<Notificacion>('/notificaciones', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // Marcar notificación como leída
    async marcarLeida(id: string, leida: boolean = true): Promise<ApiResponse<Notificacion>> {
        return fetchApi<Notificacion>(`/notificaciones/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ leida }),
        })
    },

    // Marcar todas las notificaciones como leídas
    async marcarTodasLeidas(): Promise<ApiResponse<{ message: string }>> {
        return fetchApi<{ message: string }>('/notificaciones/marcar-todas-leidas', {
            method: 'POST',
        })
    },

    // Eliminar notificación
    async delete(id: string): Promise<ApiResponse<{ message: string }>> {
        return fetchApi<{ message: string }>(`/notificaciones/${id}`, {
            method: 'DELETE',
        })
    },
}

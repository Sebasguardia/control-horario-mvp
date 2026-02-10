import type { Jornada } from '@/types/jornada.types'

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

// Jornadas
export const jornadasApi = {
    // Obtener todas las jornadas con filtros opcionales
    async getAll(params?: {
        desde?: string
        hasta?: string
        limit?: number
    }): Promise<ApiResponse<Jornada[]>> {
        const searchParams = new URLSearchParams()
        if (params?.desde) searchParams.append('desde', params.desde)
        if (params?.hasta) searchParams.append('hasta', params.hasta)
        if (params?.limit) searchParams.append('limit', params.limit.toString())

        const query = searchParams.toString()
        return fetchApi<Jornada[]>(`/jornadas${query ? `?${query}` : ''}`)
    },

    // Obtener jornada del día actual
    async getToday(): Promise<ApiResponse<Jornada>> {
        return fetchApi<Jornada>('/jornadas/hoy')
    },

    // Obtener jornada por ID
    async getById(id: string): Promise<ApiResponse<Jornada>> {
        return fetchApi<Jornada>(`/jornadas/${id}`)
    },

    // Crear/iniciar jornada
    async create(data?: { fecha?: string; notas?: string }): Promise<ApiResponse<Jornada>> {
        return fetchApi<Jornada>('/jornadas', {
            method: 'POST',
            body: JSON.stringify(data || {}),
        })
    },

    // Actualizar jornada
    async update(
        id: string,
        data: {
            accion?: 'pausar' | 'reanudar' | 'finalizar'
            hora_inicio?: string
            hora_pausa_inicio?: string
            hora_pausa_fin?: string
            hora_finalizacion?: string
            estado?: string
            notas?: string
            metadata?: any
        }
    ): Promise<ApiResponse<Jornada>> {
        return fetchApi<Jornada>(`/jornadas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    // Eliminar jornada
    async delete(id: string): Promise<ApiResponse<{ message: string }>> {
        return fetchApi<{ message: string }>(`/jornadas/${id}`, {
            method: 'DELETE',
        })
    },

    // Pausar jornada
    async pausar(id: string, metadata?: any): Promise<ApiResponse<Jornada>> {
        return this.update(id, { accion: 'pausar', metadata })
    },

    // Reanudar jornada
    async reanudar(id: string, metadata?: any): Promise<ApiResponse<Jornada>> {
        return this.update(id, { accion: 'reanudar', metadata })
    },

    // Finalizar jornada
    async finalizar(id: string, metadata?: any): Promise<ApiResponse<Jornada>> {
        return this.update(id, { accion: 'finalizar', metadata })
    },
}

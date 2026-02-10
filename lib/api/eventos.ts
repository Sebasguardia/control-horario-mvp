import type { EventoJornada } from '@/types/eventos.types'

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

export const eventosApi = {
    // Obtener eventos de una jornada
    async getByJornada(jornadaId: string): Promise<ApiResponse<EventoJornada[]>> {
        return fetchApi<EventoJornada[]>(`/jornadas/${jornadaId}/eventos`)
    },

    // Crear evento de jornada
    async create(
        jornadaId: string,
        data: {
            tipo_evento: 'inicio' | 'pausa' | 'reanudacion' | 'finalizacion'
            metadata?: any
        }
    ): Promise<ApiResponse<EventoJornada>> {
        return fetchApi<EventoJornada>(`/jornadas/${jornadaId}/eventos`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },
}

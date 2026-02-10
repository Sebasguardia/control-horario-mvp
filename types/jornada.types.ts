export type EstadoJornada = 'sin_iniciar' | 'activa' | 'pausada' | 'finalizada'

export interface Jornada {
    id: string
    user_id: string
    fecha: string
    hora_inicio: string | null
    hora_pausa_inicio: string | null
    hora_pausa_fin: string | null
    hora_finalizacion: string | null
    estado: EstadoJornada
    tiempo_trabajado_segundos: number
    tiempo_pausa_segundos: number
    notas: string | null
    created_at: string
    updated_at: string
}

export interface JornadaResumen {
    fecha: string
    horasTrabajadas: string
    estado: EstadoJornada
    inicio: string
    fin: string
}
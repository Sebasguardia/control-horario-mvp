export type TipoEvento = 'inicio' | 'pausa' | 'reanudacion' | 'finalizacion'

export interface EventoJornada {
    id: string
    jornada_id: string
    tipo_evento: TipoEvento
    timestamp: string
    metadata: any | null
    created_at: string
}

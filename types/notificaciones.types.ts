export interface Notificacion {
    id: string
    user_id: string
    tipo: string
    titulo: string
    mensaje: string | null
    leida: boolean
    created_at: string
}

export interface CreateNotificacionData {
    user_id?: string
    tipo: string
    titulo: string
    mensaje?: string
}

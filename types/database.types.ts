export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            perfiles: {
                Row: {
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
                Insert: {
                    id: string
                    nombre_completo?: string | null
                    departamento?: string | null
                    cargo?: string | null
                    avatar_url?: string | null
                    fecha_ingreso?: string | null
                    hora_inicio_default?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    nombre_completo?: string | null
                    departamento?: string | null
                    cargo?: string | null
                    avatar_url?: string | null
                    fecha_ingreso?: string | null
                    hora_inicio_default?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            jornadas: {
                Row: {
                    id: string
                    user_id: string
                    fecha: string
                    hora_inicio: string | null
                    hora_pausa_inicio: string | null
                    hora_pausa_fin: string | null
                    hora_finalizacion: string | null
                    estado: 'sin_iniciar' | 'activa' | 'pausada' | 'finalizada'
                    tiempo_trabajado_segundos: number
                    tiempo_pausa_segundos: number
                    notas: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    fecha?: string
                    hora_inicio?: string | null
                    hora_pausa_inicio?: string | null
                    hora_pausa_fin?: string | null
                    hora_finalizacion?: string | null
                    estado?: 'sin_iniciar' | 'activa' | 'pausada' | 'finalizada'
                    tiempo_trabajado_segundos?: number
                    tiempo_pausa_segundos?: number
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    fecha?: string
                    hora_inicio?: string | null
                    hora_pausa_inicio?: string | null
                    hora_pausa_fin?: string | null
                    hora_finalizacion?: string | null
                    estado?: 'sin_iniciar' | 'activa' | 'pausada' | 'finalizada'
                    tiempo_trabajado_segundos?: number
                    tiempo_pausa_segundos?: number
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
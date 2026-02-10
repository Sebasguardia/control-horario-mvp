import { format, formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatearFecha(fecha: string | Date): string {
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es })
}

export function formatearHora(fecha: string | Date): string {
    return format(new Date(fecha), 'HH:mm', { locale: es })
}

export function formatearFechaLarga(fecha: string | Date): string {
    return format(new Date(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
}

export function formatearSegundosATiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
}

export function formatearSegundosAHoras(segundos: number): string {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)

    return `${horas}h ${minutos}m`
}

export function tiempoRelativo(fecha: string | Date): string {
    return formatDistance(new Date(fecha), new Date(), {
        addSuffix: true,
        locale: es,
    })
}
export function calcularTiempoTrabajado(
    horaInicio: string | null,
    horaFin: string | null,
    horaPausaInicio: string | null,
    horaPausaFin: string | null
): number {
    if (!horaInicio) return 0

    const inicio = new Date(horaInicio).getTime()
    const fin = horaFin ? new Date(horaFin).getTime() : Date.now()

    let tiempoTotal = Math.floor((fin - inicio) / 1000)

    // Restar tiempo de pausa si existe
    if (horaPausaInicio && horaPausaFin) {
        const pausaInicio = new Date(horaPausaInicio).getTime()
        const pausaFin = new Date(horaPausaFin).getTime()
        const tiempoPausa = Math.floor((pausaFin - pausaInicio) / 1000)
        tiempoTotal -= tiempoPausa
    } else if (horaPausaInicio && !horaPausaFin) {
        // Pausa activa, restar desde inicio de pausa hasta inicio de jornada
        const pausaInicio = new Date(horaPausaInicio).getTime()
        const tiempoAntesDePausa = Math.floor((pausaInicio - inicio) / 1000) // ← AQUÍ ESTABA EL ERROR
        return tiempoAntesDePausa
    }

    return Math.max(0, tiempoTotal)
}

export function calcularTiempoPausa(
    horaPausaInicio: string | null,
    horaPausaFin: string | null
): number {
    if (!horaPausaInicio) return 0

    const pausaInicio = new Date(horaPausaInicio).getTime()
    const pausaFin = horaPausaFin ? new Date(horaPausaFin).getTime() : Date.now()

    return Math.floor((pausaFin - pausaInicio) / 1000)
}
import * as XLSX from 'xlsx'
import { Jornada } from '@/types/jornada.types'
import { formatearFecha, formatearHora, formatearSegundosAHoras } from './formatters'

export interface ExportJornadaData {
    Fecha: string
    'Hora Inicio': string
    'Hora Pausa Inicio': string
    'Hora Pausa Fin': string
    'Hora Finalización': string
    'Tiempo Trabajado': string
    'Tiempo Pausa': string
    Estado: string
    Notas: string
}

export function exportarJornadasAExcel(jornadas: Jornada[], nombreArchivo?: string) {
    // Preparar datos para exportación
    const datosExport: ExportJornadaData[] = jornadas.map((jornada) => ({
        Fecha: formatearFecha(jornada.fecha),
        'Hora Inicio': jornada.hora_inicio ? formatearHora(jornada.hora_inicio) : '-',
        'Hora Pausa Inicio': jornada.hora_pausa_inicio
            ? formatearHora(jornada.hora_pausa_inicio)
            : '-',
        'Hora Pausa Fin': jornada.hora_pausa_fin
            ? formatearHora(jornada.hora_pausa_fin)
            : '-',
        'Hora Finalización': jornada.hora_finalizacion
            ? formatearHora(jornada.hora_finalizacion)
            : '-',
        'Tiempo Trabajado': formatearSegundosAHoras(jornada.tiempo_trabajado_segundos),
        'Tiempo Pausa': formatearSegundosAHoras(jornada.tiempo_pausa_segundos),
        Estado: estadoTexto(jornada.estado),
        Notas: jornada.notas || '-',
    }))

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datosExport)

    // Ajustar ancho de columnas
    const columnWidths = [
        { wch: 12 }, // Fecha
        { wch: 12 }, // Hora Inicio
        { wch: 18 }, // Hora Pausa Inicio
        { wch: 16 }, // Hora Pausa Fin
        { wch: 18 }, // Hora Finalización
        { wch: 16 }, // Tiempo Trabajado
        { wch: 14 }, // Tiempo Pausa
        { wch: 12 }, // Estado
        { wch: 30 }, // Notas
    ]
    ws['!cols'] = columnWidths

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Jornadas')

    // Generar nombre de archivo
    const fecha = new Date().toISOString().split('T')[0]
    const nombre = nombreArchivo || `jornadas_${fecha}.xlsx`

    // Descargar archivo
    XLSX.writeFile(wb, nombre)
}

export function exportarResumenMensualAExcel(
    jornadas: Jornada[],
    mes: string,
    año: string
) {
    // Calcular estadísticas mensuales
    const totalHoras = jornadas.reduce(
        (sum, j) => sum + j.tiempo_trabajado_segundos,
        0
    )
    const diasTrabajados = jornadas.filter(j => j.estado === 'finalizada').length
    const promedioDiario = diasTrabajados > 0 ? totalHoras / diasTrabajados : 0

    // Datos de resumen
    const resumen = [
        { Concepto: 'Mes', Valor: `${mes} ${año}` },
        { Concepto: 'Total de Horas', Valor: formatearSegundosAHoras(totalHoras) },
        { Concepto: 'Días Trabajados', Valor: diasTrabajados.toString() },
        {
            Concepto: 'Promedio Diario',
            Valor: formatearSegundosAHoras(Math.floor(promedioDiario))
        },
        { Concepto: '', Valor: '' }, // Línea en blanco
    ]

    // Datos detallados
    const detalle: ExportJornadaData[] = jornadas.map((jornada) => ({
        Fecha: formatearFecha(jornada.fecha),
        'Hora Inicio': jornada.hora_inicio ? formatearHora(jornada.hora_inicio) : '-',
        'Hora Pausa Inicio': jornada.hora_pausa_inicio
            ? formatearHora(jornada.hora_pausa_inicio)
            : '-',
        'Hora Pausa Fin': jornada.hora_pausa_fin
            ? formatearHora(jornada.hora_pausa_fin)
            : '-',
        'Hora Finalización': jornada.hora_finalizacion
            ? formatearHora(jornada.hora_finalizacion)
            : '-',
        'Tiempo Trabajado': formatearSegundosAHoras(jornada.tiempo_trabajado_segundos),
        'Tiempo Pausa': formatearSegundosAHoras(jornada.tiempo_pausa_segundos),
        Estado: estadoTexto(jornada.estado),
        Notas: jornada.notas || '-',
    }))

    // Crear workbook
    const wb = XLSX.utils.book_new()

    // Crear worksheet de resumen
    const wsResumen = XLSX.utils.json_to_sheet(resumen, { skipHeader: false })
    wsResumen['!cols'] = [{ wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

    // Crear worksheet de detalle
    const wsDetalle = XLSX.utils.json_to_sheet(detalle)
    wsDetalle['!cols'] = [
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 16 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle')

    // Descargar
    XLSX.writeFile(wb, `reporte_${mes}_${año}.xlsx`)
}

function estadoTexto(estado: string): string {
    const estados: Record<string, string> = {
        sin_iniciar: 'Sin Iniciar',
        activa: 'Activa',
        pausada: 'Pausada',
        finalizada: 'Finalizada',
    }
    return estados[estado] || estado
}

// Exportar a CSV (alternativa más liviana)
export function exportarJornadasACSV(jornadas: Jornada[], nombreArchivo?: string) {
    const datosExport: ExportJornadaData[] = jornadas.map((jornada) => ({
        Fecha: formatearFecha(jornada.fecha),
        'Hora Inicio': jornada.hora_inicio ? formatearHora(jornada.hora_inicio) : '-',
        'Hora Pausa Inicio': jornada.hora_pausa_inicio
            ? formatearHora(jornada.hora_pausa_inicio)
            : '-',
        'Hora Pausa Fin': jornada.hora_pausa_fin
            ? formatearHora(jornada.hora_pausa_fin)
            : '-',
        'Hora Finalización': jornada.hora_finalizacion
            ? formatearHora(jornada.hora_finalizacion)
            : '-',
        'Tiempo Trabajado': formatearSegundosAHoras(jornada.tiempo_trabajado_segundos),
        'Tiempo Pausa': formatearSegundosAHoras(jornada.tiempo_pausa_segundos),
        Estado: estadoTexto(jornada.estado),
        Notas: jornada.notas || '-',
    }))

    // Crear CSV
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datosExport)
    XLSX.utils.book_append_sheet(wb, ws, 'Jornadas')

    // Generar nombre
    const fecha = new Date().toISOString().split('T')[0]
    const nombre = nombreArchivo || `jornadas_${fecha}.csv`

    // Descargar como CSV
    XLSX.writeFile(wb, nombre, { bookType: 'csv' })
}
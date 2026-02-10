export const APP_CONFIG = {
    name: 'Control Horario MVP',
    description: 'Sistema de control de asistencia laboral',
    version: '1.0.0',
    author: 'Tu Equipo',
} as const

export const JORNADA_CONFIG = {
    horaInicioDefault: '08:00',
    duracionJornadaEstandar: 8 * 3600, // 8 horas en segundos
    duracionPausaEstandar: 3600, // 1 hora en segundos
    alertaPausaLargaMinutos: 120, // 2 horas
} as const

export const PAGINATION_CONFIG = {
    itemsPerPage: 10,
    itemsPerPageOptions: [10, 25, 50, 100],
} as const

export const DATE_FORMAT = {
    display: 'dd/MM/yyyy',
    displayLong: "EEEE, d 'de' MMMM 'de' yyyy",
    time: 'HH:mm',
    timeWithSeconds: 'HH:mm:ss',
    iso: 'yyyy-MM-dd',
} as const
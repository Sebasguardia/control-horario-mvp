# API Client

Este directorio contiene las funciones helper para consumir las APIs del backend.

## Uso

### Jornadas

```typescript
import { jornadasApi } from '@/lib/api'

// Obtener jornada del día actual
const { data: jornada, error } = await jornadasApi.getToday()

// Crear/iniciar jornada
const { data: nuevaJornada, error } = await jornadasApi.create()

// Pausar jornada
const { data: jornadaPausada, error } = await jornadasApi.pausar(jornadaId)

// Reanudar jornada
const { data: jornadaReanudada, error } = await jornadasApi.reanudar(jornadaId)

// Finalizar jornada
const { data: jornadaFinalizada, error } = await jornadasApi.finalizar(jornadaId)

// Obtener todas las jornadas con filtros
const { data: jornadas, error } = await jornadasApi.getAll({
  desde: '2024-01-01',
  hasta: '2024-01-31',
  limit: 10
})
```

### Eventos de Jornada

```typescript
import { eventosApi } from '@/lib/api'

// Obtener eventos de una jornada
const { data: eventos, error } = await eventosApi.getByJornada(jornadaId)

// Crear evento
const { data: evento, error } = await eventosApi.create(jornadaId, {
  tipo_evento: 'pausa',
  metadata: { motivo: 'Almuerzo' }
})
```

### Notificaciones

```typescript
import { notificacionesApi } from '@/lib/api'

// Obtener todas las notificaciones
const { data: notificaciones, error } = await notificacionesApi.getAll()

// Obtener solo no leídas
const { data: noLeidas, error } = await notificacionesApi.getNoLeidas(10)

// Marcar como leída
const { data, error } = await notificacionesApi.marcarLeida(notificacionId)

// Marcar todas como leídas
const { data, error } = await notificacionesApi.marcarTodasLeidas()

// Crear notificación
const { data: nuevaNotif, error } = await notificacionesApi.create({
  tipo: 'info',
  titulo: 'Nueva jornada iniciada',
  mensaje: 'Has iniciado tu jornada de trabajo'
})
```

### Perfiles

```typescript
import { perfilesApi } from '@/lib/api'

// Obtener perfil
const { data: perfil, error } = await perfilesApi.get()

// Actualizar perfil
const { data: perfilActualizado, error } = await perfilesApi.update({
  nombre_completo: 'Juan Pérez',
  departamento: 'IT',
  cargo: 'Desarrollador'
})
```

## Manejo de Errores

Todas las funciones retornan un objeto con `data` y `error`:

```typescript
const { data, error } = await jornadasApi.getToday()

if (error) {
  console.error('Error:', error)
  // Manejar error
  return
}

// Usar data
console.log(data)
```

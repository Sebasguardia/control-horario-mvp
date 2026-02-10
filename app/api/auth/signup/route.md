# Endpoint de Signup

Este endpoint maneja el registro de nuevos usuarios.

## Uso

```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123',
    nombre_completo: 'Juan Pérez',
    departamento: 'IT', // opcional
    cargo: 'Desarrollador', // opcional
  }),
})

const result = await response.json()
```

## Notas Importantes

1. **Confirmación de Email**: Si tu proyecto de Supabase tiene confirmación de email habilitada, el usuario necesitará verificar su email antes de poder iniciar sesión.

2. **Creación de Perfil**: El endpoint intenta crear el perfil automáticamente, pero si falla por RLS (Row Level Security), el perfil se puede crear después cuando el usuario inicie sesión.

3. **Trigger Recomendado**: Para una mejor experiencia, ejecuta el trigger SQL (`supabase-trigger.sql`) en Supabase para crear el perfil automáticamente cuando se crea un usuario.

4. **Metadata**: Si usas el trigger, puedes pasar datos adicionales en `raw_user_meta_data` al hacer signUp:

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      nombre_completo: 'Juan Pérez',
      departamento: 'IT',
      cargo: 'Desarrollador',
    }
  }
})
```

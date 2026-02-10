// app/test-toast/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TestToastPage() {
    return (
        <div className="container mx-auto py-8 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Test de Toasts</h1>

            <Button onClick={() => toast.success('¡Éxito!')}>
                Success Toast
            </Button>

            <Button onClick={() => toast.error('Error!')}>
                Error Toast
            </Button>

            <Button onClick={() => toast.warning('Advertencia!')}>
                Warning Toast
            </Button>

            <Button onClick={() => toast.info('Información')}>
                Info Toast
            </Button>

            <Button onClick={() => {
                const id = toast.loading('Cargando...')
                setTimeout(() => {
                    toast.success('¡Completado!', { id })
                }, 2000)
            }}>
                Loading Toast
            </Button>

            <Button onClick={() => {
                toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                        loading: 'Guardando...',
                        success: '¡Guardado!',
                        error: 'Error al guardar',
                    }
                )
            }}>
                Promise Toast
            </Button>
        </div>
    )
}
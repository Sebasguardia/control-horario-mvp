'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { useJornada } from '@/hooks/useJornada'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { LiveTimer } from './LiveTimer'
import { StatusBadge } from './StatusBadge'
import { EventTimeline } from './EventTimeline'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function JornadaControl() {
    const { user } = useAuth()
    const {
        jornadaActual,
        loading,
        tiempoTranscurrido,
        iniciarJornada,
        pausarJornada,
        reanudarJornada,
        finalizarJornada,
    } = useJornada(user?.id)

    const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)

    const handleIniciar = async () => {
        await iniciarJornada()
    }

    const handlePausar = async () => {
        await pausarJornada()
    }

    const handleReanudar = async () => {
        await reanudarJornada()
    }

    const handleFinalizar = async () => {
        setShowConfirmFinalizar(false)
        await finalizarJornada()
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <LoadingSpinner text="Cargando jornada..." />
                </CardContent>
            </Card>
        )
    }

    const estado = jornadaActual?.estado || 'sin_iniciar'

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Control de Jornada</CardTitle>
                        <CardDescription>
                            Gestiona tu tiempo de trabajo diario
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Timer */}
                        <div className="flex flex-col items-center gap-4">
                            <LiveTimer segundos={tiempoTranscurrido} estado={estado} />
                            <StatusBadge estado={estado} />
                        </div>

                        {/* Botones de Control */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Botón Iniciar */}
                            <Button
                                size="lg"
                                onClick={handleIniciar}
                                disabled={estado !== 'sin_iniciar'}
                                className="h-14"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Iniciar Jornada
                            </Button>

                            {/* Botón Pausar/Reanudar */}
                            {estado === 'activa' ? (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handlePausar}
                                    className="h-14"
                                >
                                    <Pause className="mr-2 h-5 w-5" />
                                    Pausar
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleReanudar}
                                    disabled={estado !== 'pausada'}
                                    className="h-14"
                                >
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Reanudar
                                </Button>
                            )}

                            {/* Botón Finalizar */}
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={() => setShowConfirmFinalizar(true)}
                                disabled={estado === 'sin_iniciar' || estado === 'finalizada'}
                                className="h-14"
                            >
                                <Square className="mr-2 h-5 w-5" />
                                Finalizar
                            </Button>
                        </div>

                        {/* Timeline de Eventos */}
                        {jornadaActual && <EventTimeline jornada={jornadaActual} />}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={showConfirmFinalizar}
                onOpenChange={setShowConfirmFinalizar}
                title="Finalizar Jornada"
                description="¿Estás seguro de que deseas finalizar tu jornada? Esta acción no se puede deshacer."
                confirmText="Finalizar"
                cancelText="Cancelar"
                onConfirm={handleFinalizar}
                variant="destructive"
            />
        </>
    )
}
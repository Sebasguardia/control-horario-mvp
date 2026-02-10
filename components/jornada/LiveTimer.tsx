'use client'

import { formatearSegundosATiempo } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import type { EstadoJornada } from '@/types/jornada.types'

interface LiveTimerProps {
    segundos: number
    estado: EstadoJornada
}

export function LiveTimer({ segundos, estado }: LiveTimerProps) {
    const tiempo = formatearSegundosATiempo(segundos)

    return (
        <motion.div
            className="relative"
            animate={estado === 'activa' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <div className="text-6xl md:text-7xl font-mono font-bold tracking-wider">
                {tiempo}
            </div>
            {estado === 'activa' && (
                <motion.div
                    className="absolute -inset-4 rounded-full bg-primary/10 -z-10"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </motion.div>
    )
}
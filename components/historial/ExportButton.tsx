'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import type { Jornada } from '@/types/jornada.types'
import { exportarJornadasAExcel, exportarJornadasACSV } from '@/lib/utils/export'
import { toast } from 'sonner'

interface ExportButtonProps {
    jornadas: Jornada[]
    disabled?: boolean
}

export function ExportButton({ jornadas, disabled }: ExportButtonProps) {
    const handleExportExcel = () => {
        try {
            exportarJornadasAExcel(jornadas)
            toast.success('Archivo Excel descargado')
        } catch (error) {
            console.error('Error al exportar:', error)
            toast.error('Error al exportar archivo')
        }
    }

    const handleExportCSV = () => {
        try {
            exportarJornadasACSV(jornadas)
            toast.success('Archivo CSV descargado')
        } catch (error) {
            console.error('Error al exportar:', error)
            toast.error('Error al exportar archivo')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled || jornadas.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    Exportar a Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    Exportar a CSV (.csv)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
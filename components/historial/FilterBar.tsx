'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface FilterBarProps {
    onFilter: (desde: Date, hasta: Date) => void
    onClear: () => void
    defaultDesde?: Date
    defaultHasta?: Date
}

export function FilterBar({
    onFilter,
    onClear,
    defaultDesde,
    defaultHasta,
}: FilterBarProps) {
    const [desde, setDesde] = useState(
        defaultDesde ? format(defaultDesde, 'yyyy-MM-dd') : ''
    )
    const [hasta, setHasta] = useState(
        defaultHasta ? format(defaultHasta, 'yyyy-MM-dd') : ''
    )

    const handleFilter = () => {
        if (desde && hasta) {
            onFilter(new Date(desde), new Date(hasta))
        }
    }

    const handleClear = () => {
        setDesde('')
        setHasta('')
        onClear()
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Fecha Desde */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="desde">Desde</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="desde"
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Fecha Hasta */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="hasta">Hasta</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="hasta"
                                type="date"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleFilter}
                            disabled={!desde || !hasta}
                            className="min-w-[100px]"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            disabled={!desde && !hasta}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Limpiar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
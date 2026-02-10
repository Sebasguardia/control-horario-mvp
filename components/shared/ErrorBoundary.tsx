'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error boundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
                    <div className="rounded-full bg-destructive/10 p-4 mb-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                        {this.state.error?.message || 'Ha ocurrido un error inesperado'}
                    </p>
                    <Button onClick={() => this.setState({ hasError: false })}>
                        Intentar de nuevo
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
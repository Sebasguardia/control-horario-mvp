import Link from 'next/link'
import { Clock, BarChart3, History, Shield, Zap, Users } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="mx-auto w-full max-w-7xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary p-2">
                            <Clock className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold">Control Horario</span>
                    </div>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                            Ingresar
                        </Link>
                        <Link 
                            href="/signup" 
                            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Regístrate
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Control Horario MVP
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Sistema sencillo y eficiente para controlar entradas y salidas, generar reportes y llevar el historial completo de jornadas laborales.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link 
                                href="/signup" 
                                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
                            >
                                Crear cuenta gratis
                            </Link>
                            <Link 
                                href="/login" 
                                className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors w-full sm:w-auto justify-center"
                            >
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <Clock className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Control de Jornadas</h3>
                            <p className="text-sm text-muted-foreground">
                                Inicia, pausa y finaliza tus jornadas laborales con un solo clic.
                            </p>
                        </div>

                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <History className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Historial Completo</h3>
                            <p className="text-sm text-muted-foreground">
                                Accede a todo tu historial de jornadas con filtros y búsqueda avanzada.
                            </p>
                        </div>

                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <BarChart3 className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Reportes Detallados</h3>
                            <p className="text-sm text-muted-foreground">
                                Genera reportes y visualiza estadísticas de tu tiempo trabajado.
                            </p>
                        </div>

                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <Shield className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Seguro y Confiable</h3>
                            <p className="text-sm text-muted-foreground">
                                Tus datos están protegidos con las mejores prácticas de seguridad.
                            </p>
                        </div>

                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <Zap className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Rápido y Simple</h3>
                            <p className="text-sm text-muted-foreground">
                                Interfaz intuitiva diseñada para ser fácil de usar.
                            </p>
                        </div>

                        <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                            <Users className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Gestión de Perfil</h3>
                            <p className="text-sm text-muted-foreground">
                                Personaliza tu perfil y configura tus preferencias.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 text-sm text-center text-muted-foreground">
                    © {new Date().getFullYear()} Control Horario MVP. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}

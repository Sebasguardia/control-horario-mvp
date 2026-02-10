import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto w-full max-w-7xl px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
                        Control Horario
                    </Link>
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

            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">{children}</div>
            </main>

            <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto w-full max-w-7xl px-4 py-4 text-sm text-center text-muted-foreground">
                    © {new Date().getFullYear()} Control Horario MVP
                </div>
            </footer>
        </div>
    )
}

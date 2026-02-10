import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/auth/callback - Manejar callback de autenticación
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const next = searchParams.get('next') || '/'

        if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error) {
                return NextResponse.redirect(new URL(next, request.url))
            }
        }

        // Si hay error o no hay código, redirigir al login
        return NextResponse.redirect(new URL('/login', request.url))
    } catch (error) {
        console.error('Error en callback de autenticación:', error)
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
    }
}

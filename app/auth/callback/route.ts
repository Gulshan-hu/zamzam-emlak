import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
      )
    }

    // Get user after successful code exchange
    const { data: { user } } = await supabase.auth.getUser()

    // OAuth sign-in successful - redirect to dashboard or custom next URL
    if (user) {
      const redirectTo = next || '/dashboard'
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
    }
  }

  // Fallback - redirect to login if no code or session
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}

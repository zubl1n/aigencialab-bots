import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth Callback — exchanges code for session after email link or OAuth
 * Redirects admin users → /admin, regular users → /dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const isAdmin =
        data.user.app_metadata?.role === 'admin' ||
        data.user.user_metadata?.role === 'admin'
      
      const redirectTo = isAdmin ? '/admin' : next
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // If no code or error, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=callback_failed`)
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required on every request for @supabase/ssr
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const isAuthRoute = pathname === '/login' || pathname === '/change-password'

  if (!user) {
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Authenticated: check must_change_password
  if (!isAuthRoute) {
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('must_change_password, role')
      .eq('id', user.id)
      .single()

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }

    // Admin guard
    if (pathname.startsWith('/admin') && profile?.role !== 'superadmin' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

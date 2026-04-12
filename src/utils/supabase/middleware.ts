import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type AppRole = 'supplier' | 'reseller' | 'admin'

function normalizeRole(role: unknown): AppRole | null {
  if (typeof role !== 'string') {
    return null
  }

  if (role === 'supplier' || role === 'reseller' || role === 'admin') {
    return role
  }

  return null
}

function getInitialRouteForRole(role: AppRole): '/supplier' | '/reseller' {
  if (role === 'reseller') {
    return '/reseller'
  }

  return '/supplier'
}

function createRedirectResponse(url: URL, sessionResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url)

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value)
  })

  sessionResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'location') {
      redirectResponse.headers.set(key, value)
    }
  })

  return redirectResponse
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname
  const isSupplierRoute = pathname.startsWith('/supplier')
  const isResellerRoute = pathname.startsWith('/reseller')
  const isAdminRoute = pathname.startsWith('/admin')
  const isPrivateRoute = isSupplierRoute || isResellerRoute || isAdminRoute
  const isLoginRoute = pathname === '/login'

  if (!user && isPrivateRoute) {
    url.pathname = '/login'
    return createRedirectResponse(url, supabaseResponse)
  }

  if (!user) {
    return supabaseResponse
  }

  let role = normalizeRole(user.user_metadata?.role)

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    role = normalizeRole(profile?.role)
  }

  if (!role) {
    if (isPrivateRoute) {
      url.pathname = '/login'
      return createRedirectResponse(url, supabaseResponse)
    }

    return supabaseResponse
  }

  const roleHome = getInitialRouteForRole(role)

  if (isLoginRoute) {
    url.pathname = roleHome
    return createRedirectResponse(url, supabaseResponse)
  }

  const canAccessSupplier = role === 'admin' || role === 'supplier'
  const canAccessReseller = role === 'admin' || role === 'reseller'
  const canAccessAdmin = role === 'admin'

  if (
    (isSupplierRoute && !canAccessSupplier) ||
    (isResellerRoute && !canAccessReseller) ||
    (isAdminRoute && !canAccessAdmin)
  ) {
    url.pathname = roleHome
    return createRedirectResponse(url, supabaseResponse)
  }

  return supabaseResponse
}

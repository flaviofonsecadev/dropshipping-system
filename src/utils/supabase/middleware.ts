import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const isSupplierRoute = url.pathname.startsWith('/supplier')
  const isResellerRoute = url.pathname.startsWith('/reseller')

  if (!user && (isSupplierRoute || isResellerRoute)) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    let role = user.user_metadata?.role

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      role = profile?.role
    }

    if (isSupplierRoute && role !== 'admin') {
      url.pathname = role === 'reseller' ? '/reseller' : '/'
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse to redirectResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    if (isResellerRoute && role !== 'reseller') {
      url.pathname = role === 'admin' ? '/supplier' : '/'
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse to redirectResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}

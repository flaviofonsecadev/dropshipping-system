import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cria cliente que respeita RLS (usando sessão do usuário)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignorar erro de `setAll` se for chamado no Server Component
          }
        },
      },
    }
  )
}

// Cria cliente com Service Role para ignorar RLS (apenas para leitura de profiles seguros no servidor)
// Retorna null caso a chave não esteja configurada no ambiente
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return null
  }
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client não gerencia sessão via cookies
        }
      }
    }
  )
}

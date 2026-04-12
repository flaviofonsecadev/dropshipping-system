import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Extrai o redirecionamento (o 'next' param é de onde o usuário deveria ir após autenticar)
  // No caso de recuperação de senha: next=/login?type=recovery
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sessão estabelecida, redireciona de volta com os parâmetros adequados
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro ou não houver código, envia para a home ou login
  return NextResponse.redirect(`${origin}/login?error=access_denied&error_code=otp_expired`)
}

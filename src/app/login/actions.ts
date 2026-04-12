'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { AuthActionType, AuthActionStatus, AppRole, AuthActionState } from './types'

function createAuthState(
  action: AuthActionType,
  status: Exclude<AuthActionStatus, 'idle'>,
  message: string
): AuthActionState {
  return { action, status, message }
}

function getCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  return { email, password }
}

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

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient()
  const { email, password } = getCredentials(formData)

  if (!email || !password) {
    return createAuthState('login', 'error', 'E-mail e senha são obrigatórios.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return createAuthState('login', 'error', error.message)
  }

  let role = normalizeRole(data.user.user_metadata?.role)

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    role = normalizeRole(profile?.role)
  }

  redirect(role ? getInitialRouteForRole(role) : '/')
}

export async function signupAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  if (!email || !password) {
    return createAuthState('signup', 'error', 'E-mail e senha são obrigatórios.')
  }

  if (password.length < 6) {
    return createAuthState('signup', 'error', 'A senha deve ter pelo menos 6 caracteres.')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return createAuthState('signup', 'error', error.message)
  }

  return createAuthState('signup', 'success', 'Verifique seu e-mail para confirmar o cadastro!')
}

export async function resetPasswordAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const supabase = await createClient()

  if (!email) {
    return createAuthState('reset_password', 'error', 'Informe o seu e-mail para recuperar a senha.')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/login?type=recovery`,
  })

  if (error) {
    return createAuthState('reset_password', 'error', error.message)
  }

  return createAuthState('reset_password', 'success', 'Instruções de recuperação enviadas para o seu e-mail!')
}

export async function updatePasswordAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const supabase = await createClient()

  if (!password || !confirmPassword) {
    return createAuthState('update_password', 'error', 'As senhas são obrigatórias.')
  }

  if (password.length < 6) {
    return createAuthState('update_password', 'error', 'A senha deve ter pelo menos 6 caracteres.')
  }

  if (password !== confirmPassword) {
    return createAuthState('update_password', 'error', 'As senhas não coincidem.')
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    // Tratar erro comum de sessão expirada/link usado
    if (error.message.includes('Auth session missing')) {
      return createAuthState('update_password', 'error', 'Sua sessão expirou ou o link já foi usado. Por favor, solicite um novo link de recuperação.')
    }
    // Tratar erro de senha igual a antiga
    if (error.message.includes('New password should be different from the old password')) {
      return createAuthState('update_password', 'error', 'A nova senha deve ser diferente da sua senha atual.')
    }
    
    return createAuthState('update_password', 'error', error.message)
  }

  return createAuthState('update_password', 'success', 'Senha atualizada com sucesso! Você já pode entrar.')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

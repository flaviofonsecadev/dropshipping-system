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
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient()
  const { email, password } = getCredentials(formData)

  if (!email || !password) {
    return createAuthState('signup', 'error', 'E-mail e senha são obrigatórios.')
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

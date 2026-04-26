"use server"

import { createClient } from "@/utils/supabase/server"
import type { StorefrontAuthActionState, StorefrontAuthActionType, StorefrontAuthActionStatus } from "./types"

function createAuthState(
  action: StorefrontAuthActionType,
  status: Exclude<StorefrontAuthActionStatus, "idle">,
  message: string
): StorefrontAuthActionState {
  return { action, status, message }
}

function getSafeNext(storeSlug: string, next: string | null) {
  const fallback = storeSlug ? `/loja/${storeSlug}/checkout` : "/"
  if (!storeSlug) return fallback
  if (!next) return fallback
  const n = next.trim()
  if (!n.startsWith("/")) return fallback
  if (!n.startsWith(`/loja/${storeSlug}`)) return fallback
  return n
}

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const storeSlug = String(formData.get("store_slug") ?? "").trim()
  const next = String(formData.get("next") ?? "").trim()
  return { email, password, storeSlug, next }
}

export async function storefrontLoginAction(
  _prevState: StorefrontAuthActionState,
  formData: FormData
): Promise<StorefrontAuthActionState> {
  const supabase = await createClient()
  const { email, password, storeSlug, next } = getCredentials(formData)

  if (!storeSlug) {
    return createAuthState("login", "error", "Loja inválida.")
  }

  if (!email || !password) {
    return createAuthState("login", "error", "E-mail e senha são obrigatórios.")
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return createAuthState("login", "error", error.message)
  }

  const destination = getSafeNext(storeSlug, next || null)
  return createAuthState("login", "success", destination)
}

export async function storefrontSignupAction(
  _prevState: StorefrontAuthActionState,
  formData: FormData
): Promise<StorefrontAuthActionState> {
  const supabase = await createClient()
  const { email, password, storeSlug, next } = getCredentials(formData)

  if (!storeSlug) {
    return createAuthState("signup", "error", "Loja inválida.")
  }

  if (!email || !password) {
    return createAuthState("signup", "error", "E-mail e senha são obrigatórios.")
  }

  if (password.length < 6) {
    return createAuthState("signup", "error", "A senha deve ter pelo menos 6 caracteres.")
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        signup_origin: "storefront",
        storefront_slug: storeSlug,
      },
    },
  })

  if (error) {
    return createAuthState("signup", "error", error.message)
  }

  if (!data.session) {
    return createAuthState("signup", "success", "Conta criada. Confirme seu e-mail para continuar.")
  }

  const destination = getSafeNext(storeSlug, next || null)
  return createAuthState("signup", "success", destination)
}


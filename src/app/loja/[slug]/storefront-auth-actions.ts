"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

function getSafeNext(storeSlug: string, next: string | null) {
  const fallback = storeSlug ? `/loja/${storeSlug}` : "/"
  if (!storeSlug) return fallback
  if (!next) return fallback
  const n = next.trim()
  if (!n.startsWith("/")) return fallback
  if (!n.startsWith(`/loja/${storeSlug}`)) return fallback
  return n
}

export async function logoutStorefrontAction(formData: FormData) {
  const storeSlug = String(formData.get("store_slug") ?? "").trim()
  const next = formData.get("next")
  const destination = getSafeNext(storeSlug, typeof next === "string" ? next : null)

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(destination)
}


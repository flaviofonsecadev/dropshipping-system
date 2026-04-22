"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AsaasError, retrieveWalletId, validateApiKey } from "@/lib/asaas"
import { encryptSecret } from "@/lib/secret"

function hintFromApiKey(apiKey: string) {
  const trimmed = apiKey.trim()
  const last = trimmed.slice(-4)
  return last ? `****${last}` : null
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export async function connectExistingResellerAsaasAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const apiKey = String(formData.get("asaas_api_key") ?? "").trim()
  const walletIdInput = String(formData.get("asaas_wallet_id") ?? "").trim()
  if (!apiKey) {
    redirect("/reseller/settings/pagamentos?error=missing_api_key")
  }

  try {
    await validateApiKey(apiKey)
    const walletId = walletIdInput && isUuid(walletIdInput) ? walletIdInput : await retrieveWalletId(apiKey)
    const encrypted = encryptSecret(apiKey)
    const hint = hintFromApiKey(apiKey)

    const { error } = await supabase
      .from("profiles")
      .update({
        asaas_api_key_encrypted: encrypted,
        asaas_api_key_hint: hint,
        asaas_wallet_id: walletId,
        asaas_account_id: null,
        asaas_is_subaccount: false,
        asaas_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      redirect("/reseller/settings/pagamentos?error=save_failed")
    }
  } catch (e) {
    if (e instanceof AsaasError) {
      if (e.code === "wallet_parse_error" || e.code === "wallet_unknown_error") {
        redirect("/reseller/settings/pagamentos?error=wallet_unavailable")
      }
      redirect(`/reseller/settings/pagamentos?error=asaas_${e.status}`)
    }
    redirect("/reseller/settings/pagamentos?error=invalid_api_key")
  }

  redirect("/reseller/settings/pagamentos?saved=1")
}

export async function disconnectResellerAsaasAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      asaas_api_key_encrypted: null,
      asaas_api_key_hint: null,
      asaas_wallet_id: null,
      asaas_account_id: null,
      asaas_is_subaccount: false,
      asaas_connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    redirect("/reseller/settings/pagamentos?error=save_failed")
  }

  redirect("/reseller/settings/pagamentos?saved=1")
}

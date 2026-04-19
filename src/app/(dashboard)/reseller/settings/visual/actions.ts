"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { normalizeStorefrontSettings } from "@/lib/storefront-settings"
import { normalizeVisualSettings } from "@/lib/visual-settings"

export async function saveVisualSettingsAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rawVisual = formData.get("visual_settings")
  if (typeof rawVisual !== "string") {
    redirect("/reseller/settings/visual?error=invalid_visual_settings")
  }

  let visual_settings = normalizeVisualSettings(null)
  try {
    visual_settings = normalizeVisualSettings(JSON.parse(rawVisual))
  } catch {
    redirect("/reseller/settings/visual?error=invalid_visual_settings")
  }

  const rawSections = formData.get("storefront_sections")
  let sectionsPatch: Partial<ReturnType<typeof normalizeStorefrontSettings>["sections"]> = {}
  if (typeof rawSections === "string" && rawSections.trim()) {
    try {
      const parsed = JSON.parse(rawSections) as Record<string, unknown>
      sectionsPatch = {
        launches_title: typeof parsed.launches_title === "string" ? parsed.launches_title : undefined,
        best_sellers_title: typeof parsed.best_sellers_title === "string" ? parsed.best_sellers_title : undefined,
        launches_count: typeof parsed.launches_count === "number" ? parsed.launches_count : undefined,
        best_sellers_enabled: typeof parsed.best_sellers_enabled === "boolean" ? parsed.best_sellers_enabled : undefined,
        best_sellers_count: typeof parsed.best_sellers_count === "number" ? parsed.best_sellers_count : undefined,
      }
    } catch {
      redirect("/reseller/settings/visual?error=invalid_storefront_sections")
    }
  }

  const { data: storeRow } = await supabase.from("reseller_stores").select("storefront_settings").eq("reseller_id", user.id).maybeSingle()
  const storefrontRaw =
    storeRow && typeof storeRow === "object" && "storefront_settings" in storeRow ? (storeRow as { storefront_settings?: unknown }).storefront_settings : null
  const currentStorefront = normalizeStorefrontSettings(storefrontRaw)
  const nextStorefront = normalizeStorefrontSettings({
    ...currentStorefront,
    sections: {
      ...currentStorefront.sections,
      ...sectionsPatch,
    },
  })

  const { error } = await supabase
    .from("reseller_stores")
    .update({
      visual_settings,
      storefront_settings: nextStorefront,
      updated_at: new Date().toISOString(),
    })
    .eq("reseller_id", user.id)

  if (error) {
    redirect("/reseller/settings/visual?error=save_failed")
  }

  redirect("/reseller/settings/visual?saved=1")
}

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { VisualSettingsForm } from "./visual-settings-form"

export default async function VisualSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const resolvedSearchParams = await searchParams
  const saved = resolvedSearchParams.saved === "1"
  const error = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null

  const { data: store } = await supabase.from("reseller_stores").select("*").eq("reseller_id", user.id).maybeSingle()

  return <VisualSettingsForm store={store} saved={saved} error={error} />
}

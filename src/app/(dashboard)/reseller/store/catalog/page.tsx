import { createClient } from "@/utils/supabase/server"
import { CatalogManager } from "./catalog-manager"

export default async function ResellerStoreCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedSearchParams = await searchParams
  const saved = resolvedSearchParams.saved === "1"
  const error = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null

  const { data: products } = await supabase
    .from("products")
    .select("id,name,sku,base_cost,suggested_margin,images")
    .order("created_at", { ascending: false })

  const emptyResellerProducts: Array<{
    product_id: string
    custom_margin: number | null
    is_active: boolean
  }> = []

  const { data: resellerProducts } = user
    ? await supabase
        .from("reseller_products")
        .select("product_id,custom_margin,is_active")
        .eq("reseller_id", user.id)
    : { data: emptyResellerProducts }

  return (
    <CatalogManager
      products={products ?? []}
      resellerProducts={resellerProducts ?? []}
      saved={saved}
      error={error}
    />
  )
}

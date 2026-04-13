import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { CSSProperties } from "react"

type StorefrontStore = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  logo_url: string | null
  banner_url: string | null
  primary_color: string | null
  accent_color: string | null
  headline: string | null
  about: string | null
}

type StorefrontProduct = {
  id: string
  name: string
  sku: string
  base_cost: number
  suggested_margin: number
  images: string[] | null
}

type ResellerProductWithProduct = {
  custom_margin: number | null
  is_active: boolean
  product: StorefrontProduct | null
}

function formatBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: store } = await supabase
    .from("reseller_stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!store) {
    notFound()
  }

  const { data: items } = await supabase
    .from("reseller_products")
    .select("custom_margin,is_active,product:products(id,name,sku,base_cost,suggested_margin,images)")
    .eq("reseller_id", store.reseller_id)
    .eq("is_active", true)

  const storeTyped = store as StorefrontStore
  const typedItems = (items ?? []) as any[]

  const products = typedItems
    .filter((i) => Boolean(i.product))
    .map((i) => {
      const p = (Array.isArray(i.product) ? i.product[0] : i.product) as StorefrontProduct
      const base = Number(p.base_cost) || 0
      const margin = i.custom_margin ?? (Number(p.suggested_margin) || 0)
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        cover: Array.isArray(p.images) ? p.images[0] : null,
        price: base + margin,
        base_cost: base,
      }
    })

  const primary = storeTyped.primary_color || "#111827"
  const accent = storeTyped.accent_color || "#fbbf24"
  const cssVars = { "--store-primary": primary, "--store-accent": accent } as CSSProperties

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50" style={cssVars}>
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {storeTyped.logo_url ? (
              <img src={storeTyped.logo_url} alt={storeTyped.name} className="h-10 w-10 rounded-md object-cover border border-white/10" />
            ) : (
              <div className="h-10 w-10 rounded-md bg-white/10 border border-white/10" />
            )}
            <div className="leading-tight">
              <div className="text-xl font-bold">{storeTyped.name}</div>
              {storeTyped.headline && <div className="text-sm text-zinc-300">{storeTyped.headline}</div>}
            </div>
          </div>
          <div className="text-sm text-zinc-300">
            <span className="font-medium" style={{ color: "var(--store-accent)" }}>
              Loja do Revendedor
            </span>
          </div>
        </div>
        {storeTyped.banner_url && (
          <div className="max-w-6xl mx-auto px-4 pb-6">
            <div className="h-40 md:h-56 rounded-lg overflow-hidden border border-white/10 bg-white/5">
              <img src={storeTyped.banner_url} alt="Banner" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {storeTyped.about && <p className="text-zinc-300 max-w-3xl whitespace-pre-wrap">{storeTyped.about}</p>}

        {products.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-zinc-400">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/loja/${storeTyped.slug}/produto/${p.id}`}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
              >
                <div className="aspect-square bg-black/40 border-b border-white/10">
                  {p.cover ? (
                    <img src={p.cover} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-xs text-zinc-400">SKU: {p.sku}</div>
                  <div className="pt-2 text-lg font-bold" style={{ color: "var(--store-accent)" }}>
                    R$ {formatBRL(p.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

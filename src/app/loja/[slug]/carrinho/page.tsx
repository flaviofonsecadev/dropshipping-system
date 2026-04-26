import Link from "next/link"
import { notFound } from "next/navigation"
import type { CSSProperties } from "react"
import { createClient } from "@/utils/supabase/server"
import { StorefrontCartPageClient } from "./storefront-cart-page-client"

type StorefrontStore = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  logo_url: string | null
  primary_color: string | null
  accent_color: string | null
}

export default async function StorefrontCartPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: store } = await supabase
    .from("reseller_stores")
    .select("reseller_id,slug,name,is_published,logo_url,primary_color,accent_color")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (!store) notFound()

  const typedStore = store as StorefrontStore
  const primary = typedStore.primary_color || "#111827"
  const accent = typedStore.accent_color || "#fbbf24"
  const cssVars = { "--store-primary": primary, "--store-accent": accent } as CSSProperties

  return (
    <div className="min-h-screen bg-white text-zinc-900" style={cssVars}>
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href={`/loja/${typedStore.slug}`} className="flex items-center gap-3 min-w-0">
            {typedStore.logo_url ? (
              <img src={typedStore.logo_url} alt={typedStore.name} className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200" />
            )}
            <div className="min-w-0 leading-tight">
              <div className="text-base sm:text-lg font-bold truncate">{typedStore.name}</div>
              <div className="text-xs text-zinc-600">Carrinho</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/loja/${typedStore.slug}`} className="text-sm text-zinc-700 hover:text-zinc-900">
              Continuar comprando
            </Link>
            <Link href={`/loja/${typedStore.slug}/checkout`} className="text-sm font-medium text-zinc-900 hover:underline">
              Checkout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <StorefrontCartPageClient storeSlug={typedStore.slug} resellerId={typedStore.reseller_id} />
      </main>
    </div>
  )
}


import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { BuyButton } from "./buy-button"
import type { CSSProperties } from "react"

type StorefrontStore = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  primary_color: string | null
  accent_color: string | null
}

type StorefrontProduct = {
  id: string
  name: string
  description: string | null
  sku: string
  images: string[] | null
  videos: string[] | null
  base_cost: number
  suggested_margin: number
}

type ResellerProductWithProduct = {
  custom_margin: number | null
  is_active: boolean
  product: StorefrontProduct | null
}

function formatBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

function extractYouTubeId(url: string) {
  return url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1]
}

function extractTikTokId(url: string) {
  const m = url.match(/\/video\/(\d+)/)
  return m ? m[1] : null
}

export default async function StorefrontProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>
}) {
  const supabase = await createClient()
  const { slug, productId } = await params

  const { data: store } = await supabase
    .from("reseller_stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!store) {
    notFound()
  }

  const { data: rp } = await supabase
    .from("reseller_products")
    .select("custom_margin,is_active,product:products(*)")
    .eq("reseller_id", store.reseller_id)
    .eq("product_id", productId)
    .eq("is_active", true)
    .single()

  if (!rp || !rp.product) {
    notFound()
  }

  const storeTyped = store as StorefrontStore
  const rpTyped = rp as any
  const rawProduct = Array.isArray(rpTyped.product) ? rpTyped.product[0] : rpTyped.product
  const product = rawProduct as StorefrontProduct
  const images: string[] = Array.isArray(product.images) ? product.images : []
  const videos: string[] = Array.isArray(product.videos) ? product.videos : []

  const base = Number(product.base_cost) || 0
  const margin = rpTyped.custom_margin ?? (Number(product.suggested_margin) || 0)
  const price = base + margin
  const items = [
    {
      product_id: product.id,
      qty: 1,
      base_cost: base,
      reseller_margin: margin,
    },
  ]

  const primary = storeTyped.primary_color || "#111827"
  const accent = storeTyped.accent_color || "#fbbf24"
  const cssVars = { "--store-primary": primary, "--store-accent": accent } as CSSProperties

  const videoUrl = videos[0] || null
  const youTubeId = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) ? extractYouTubeId(videoUrl) : null
  const tikTokId = videoUrl && videoUrl.includes("tiktok.com") ? extractTikTokId(videoUrl) : null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50" style={cssVars}>
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <Link href={`/loja/${storeTyped.slug}`} className="text-sm text-zinc-300 hover:text-white">
            ← Voltar para {storeTyped.name}
          </Link>
          <div className="text-sm font-semibold" style={{ color: "var(--store-accent)" }}>
            R$ {formatBRL(price)}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
            {images[0] ? <img src={images[0]} alt={product.name} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(1, 6).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-md overflow-hidden border border-white/10 bg-black/40">
                  <img src={img} alt={`Foto ${idx + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {videoUrl && (
            <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              {youTubeId ? (
                <iframe
                  className="w-full aspect-video"
                  src={`https://www.youtube.com/embed/${youTubeId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : tikTokId ? (
                <iframe
                  className="w-full aspect-[9/16] max-h-[680px]"
                  src={`https://www.tiktok.com/embed/v2/${tikTokId}`}
                  allow="encrypted-media;"
                  allowFullScreen
                />
              ) : (
                <video className="w-full aspect-video" controls>
                  <source src={videoUrl} />
                </video>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">SKU: {product.sku}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="text-sm text-zinc-300">Preço</div>
            <div className="text-4xl font-bold" style={{ color: "var(--store-accent)" }}>
              R$ {formatBRL(price)}
            </div>
            <div className="text-sm text-zinc-400">
              Frete calculado no checkout.
            </div>
            <BuyButton resellerId={store.reseller_id} storeSlug={store.slug} items={items} />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-zinc-300 whitespace-pre-wrap">{product.description || "Sem descrição."}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

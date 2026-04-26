import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { CSSProperties } from "react"
import { normalizeStorefrontSettings } from "@/lib/storefront-settings"
import { normalizeVisualSettings } from "@/lib/visual-settings"
import type { Metadata } from "next"
import { CartIndicator } from "../../cart-indicator"
import { ProductAddToCart } from "./product-add-to-cart"
import { logoutStorefrontAction } from "../../storefront-auth-actions"

type StorefrontStore = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
  primary_color: string | null
  accent_color: string | null
  logo_url: string | null
  headline: string | null
  storefront_settings?: unknown
  visual_settings?: unknown
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

type ResellerProductRow = {
  custom_margin: number | null
  is_active: boolean
  product: StorefrontProduct | StorefrontProduct[] | null
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

function IconUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} aria-hidden="true">
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug, productId } = await params

  const { data: store } = await supabase
    .from("reseller_stores")
    .select("name,headline,reseller_id,visual_settings")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (!store) return {}

  const { data: rp } = await supabase
    .from("reseller_products")
    .select("product:products(name,description)")
    .eq("reseller_id", store.reseller_id)
    .eq("product_id", productId)
    .eq("is_active", true)
    .maybeSingle()

  const product = rp && typeof rp === "object" && "product" in rp ? (rp as { product?: { name?: string; description?: string | null } }).product : null
  const visual = normalizeVisualSettings((store as { visual_settings?: unknown }).visual_settings)

  const title = product?.name ? `${product.name} | ${store.name}` : store.name
  const description = (product?.description || visual.seo.meta_description || store.headline || undefined) ?? undefined

  return { title, description }
}

export default async function StorefrontProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; productId: string }>
  searchParams?: Promise<{ q?: string; img?: string }>
}) {
  const supabase = await createClient()
  const { slug, productId } = await params
  const sp = (await searchParams) ?? {}
  const q = (sp.q ?? "").trim()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
  const settings = normalizeStorefrontSettings(storeTyped.storefront_settings)
  const rpTyped = rp as unknown as ResellerProductRow
  const rawProduct = Array.isArray(rpTyped.product) ? rpTyped.product[0] : rpTyped.product
  const product = rawProduct as StorefrontProduct
  const images: string[] = Array.isArray(product.images) ? product.images : []
  const videos: string[] = Array.isArray(product.videos) ? product.videos : []

  const base = Number(product.base_cost) || 0
  const margin = rpTyped.custom_margin ?? (Number(product.suggested_margin) || 0)
  const price = base + margin

  const primary = storeTyped.primary_color || "#111827"
  const accent = storeTyped.accent_color || "#fbbf24"
  const cssVars = { "--store-primary": primary, "--store-accent": accent } as CSSProperties

  const videoUrl = videos[0] || null
  const youTubeId = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) ? extractYouTubeId(videoUrl) : null
  const tikTokId = videoUrl && videoUrl.includes("tiktok.com") ? extractTikTokId(videoUrl) : null

  const imgIndexRaw = Number(sp.img ?? "0")
  const imgIndex = Number.isFinite(imgIndexRaw) ? Math.min(Math.max(imgIndexRaw, 0), Math.max(images.length - 1, 0)) : 0
  const mainImage = images[imgIndex] || images[0] || null

  const homeHref = `/loja/${storeTyped.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`
  const contactHref =
    settings.topbar.contact_target === "external" && settings.topbar.contact_url
      ? settings.topbar.contact_url
      : `${homeHref}#contato`
  const loginHref = `/loja/${storeTyped.slug}/login?next=${encodeURIComponent(`/loja/${storeTyped.slug}/checkout`)}`

  return (
    <div className="min-h-screen bg-white text-zinc-900" style={cssVars}>
      {settings.topbar.enabled && (
        <div className="border-b border-zinc-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-zinc-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={homeHref} className="hover:text-zinc-900">
                {settings.topbar.home_label}
              </Link>
              {settings.topbar.contact_target === "external" ? (
                <a href={contactHref} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
                  {settings.topbar.contact_label}
                </a>
              ) : (
                <a href={contactHref} className="hover:text-zinc-900">
                  {settings.topbar.contact_label}
                </a>
              )}
            </div>
            <div className="hidden sm:block">{settings.topbar.message}</div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/loja/${storeTyped.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="flex items-center gap-3 min-w-0">
            {storeTyped.logo_url ? (
              <img src={storeTyped.logo_url} alt={storeTyped.name} className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200" />
            )}
            <div className="min-w-0 leading-tight hidden sm:block">
              <div className="text-lg font-bold truncate">{storeTyped.name}</div>
              {storeTyped.headline && <div className="text-sm text-zinc-600 truncate">{storeTyped.headline}</div>}
            </div>
          </Link>

          <form action={`/loja/${storeTyped.slug}`} method="get" className="flex-1 max-w-xl">
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="O que você está procurando?"
                className="w-full h-11 rounded-full border border-zinc-200 bg-white px-4 pr-12 text-sm outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center"
                aria-label="Pesquisar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <form action={logoutStorefrontAction}>
                <input type="hidden" name="store_slug" value={storeTyped.slug} />
                <input type="hidden" name="next" value={homeHref} />
                <button
                  type="submit"
                  className="h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center"
                  aria-label="Sair"
                >
                  <IconUser className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <Link
                href={loginHref}
                className="h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center"
                aria-label="Entrar"
              >
                <IconUser className="h-5 w-5" />
              </Link>
            )}
            <CartIndicator storeSlug={storeTyped.slug} />
            <div className="hidden sm:flex items-center gap-2">
              <Link href={`/loja/${storeTyped.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="text-sm text-zinc-700 hover:text-zinc-900">
                Voltar
              </Link>
              <div className="text-sm font-semibold">R$ {formatBRL(price)}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="aspect-square border border-zinc-200 bg-zinc-50">
            {mainImage ? <img src={mainImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(0, 10).map((img, idx) => (
                <Link
                  key={img + idx}
                  href={`/loja/${storeTyped.slug}/produto/${product.id}?img=${idx}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={[
                    "aspect-square border border-zinc-200 bg-zinc-50 overflow-hidden",
                    idx === imgIndex ? "ring-2 ring-offset-2 ring-offset-white" : "",
                  ].join(" ")}
                  style={idx === imgIndex ? ({ ["--tw-ring-color"]: "var(--store-accent)" } as unknown as CSSProperties) : undefined}
                  aria-label={`Selecionar imagem ${idx + 1}`}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                </Link>
              ))}
            </div>
          )}

          {videoUrl && (
            <div className="border border-zinc-200 bg-white overflow-hidden">
              {youTubeId ? (
                <iframe
                  className="w-full aspect-video"
                  src={`https://www.youtube.com/embed/${youTubeId}`}
                  title="Vídeo do produto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : tikTokId ? (
                <iframe className="w-full aspect-[9/16] max-h-[680px]" src={`https://www.tiktok.com/embed/v2/${tikTokId}`} allow="encrypted-media;" allowFullScreen />
              ) : (
                <video className="w-full aspect-video" controls>
                  <source src={videoUrl} />
                </video>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-sm text-zinc-600">SKU: {product.sku}</p>
          </div>

          <div id="comprar" className="border border-zinc-200 bg-white p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl font-semibold">R$ {formatBRL(price)}</div>
              <div className="text-xs text-zinc-600">
                <div>1x de R$ {formatBRL(price)}</div>
                <div>R$ {formatBRL(price)} com PIX</div>
              </div>
            </div>

            <div className="text-sm text-zinc-600">Frete calculado no checkout.</div>
            <ProductAddToCart
              resellerId={store.reseller_id}
              storeSlug={store.slug}
              productId={product.id}
              baseCost={base}
              resellerMargin={margin}
              label={settings.product_card.buy_label}
            />
          </div>

          <div className="border border-zinc-200 bg-white p-6">
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-zinc-700 whitespace-pre-wrap">{product.description || "Sem descrição."}</p>
          </div>

          <div className="sm:hidden border border-zinc-200 bg-white p-4 flex items-center justify-between">
            <Link href={`/loja/${storeTyped.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="text-sm text-zinc-700">
              Voltar
            </Link>
            <div className="text-sm font-semibold">R$ {formatBRL(price)}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

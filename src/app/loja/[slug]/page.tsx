import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import type { CSSProperties } from "react"
import { BuyButton } from "./produto/[productId]/buy-button"
import { normalizeStorefrontSettings } from "@/lib/storefront-settings"
import { normalizeVisualSettings } from "@/lib/visual-settings"
import type { Metadata } from "next"
import { CartIndicator } from "./cart-indicator"
import { logoutStorefrontAction } from "./storefront-auth-actions"

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
  storefront_settings?: unknown
  visual_settings?: unknown
}

type StorefrontProduct = {
  id: string
  name: string
  sku: string
  base_cost: number
  suggested_margin: number
  images: string[] | null
}

type ResellerProductRow = {
  custom_margin: number | null
  is_active: boolean
  product: StorefrontProduct | StorefrontProduct[] | null
}

function formatBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

function buildSearchHref(slug: string, q: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : ""
  return `/loja/${slug}${query}`
}

function parseKeywords(input: string | null) {
  if (!input) return undefined
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  return parts.length ? parts : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: store } = await supabase
    .from("reseller_stores")
    .select("name,headline,visual_settings")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (!store) return {}

  const visual = normalizeVisualSettings((store as { visual_settings?: unknown }).visual_settings)
  const title = visual.seo.meta_title || store.name
  const description = visual.seo.meta_description || store.headline || undefined
  const keywords = parseKeywords(visual.seo.meta_keywords)

  return { title, description, keywords }
}

function IconUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} aria-hidden="true">
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  )
}

function IconHeart(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} aria-hidden="true">
      <path
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.6-9.3-9A5.6 5.6 0 0 1 12 6a5.6 5.6 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9Z"
      />
    </svg>
  )
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params
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

  const { data: items } = await supabase
    .from("reseller_products")
    .select("custom_margin,is_active,product:products(id,name,sku,base_cost,suggested_margin,images)")
    .eq("reseller_id", store.reseller_id)
    .eq("is_active", true)

  const storeTyped = store as StorefrontStore
  const settings = normalizeStorefrontSettings(storeTyped.storefront_settings)
  const visual = normalizeVisualSettings(storeTyped.visual_settings)
  const typedItems = (items ?? []) as unknown as ResellerProductRow[]
  const loginHref = `/loja/${storeTyped.slug}/login?next=${encodeURIComponent(`/loja/${storeTyped.slug}/checkout`)}`

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
        reseller_margin: margin,
      }
    })
    .filter((p) => {
      if (!q) return true
      const qq = q.toLowerCase()
      return p.name.toLowerCase().includes(qq) || p.sku.toLowerCase().includes(qq)
    })

  const primary = storeTyped.primary_color || "#111827"
  const accent = storeTyped.accent_color || "#fbbf24"
  const cssVars = { "--store-primary": primary, "--store-accent": accent } as CSSProperties

  const lancamentos = q ? products : products.slice(0, settings.sections.launches_count)
  const maisVendidos =
    q || !settings.sections.best_sellers_enabled
      ? []
      : products.slice(settings.sections.launches_count, settings.sections.launches_count + settings.sections.best_sellers_count)

  const heroItems = visual.hero.items.filter((i) => i.enabled)
  const promoItems = visual.promos.items.filter((i) => i.enabled)

  return (
    <div className="min-h-screen bg-white text-zinc-900" style={cssVars}>
      {settings.topbar.enabled && (
        <div className="border-b border-zinc-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-zinc-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/loja/${storeTyped.slug}`} className="hover:text-zinc-900">
                {settings.topbar.home_label}
              </Link>
              {settings.topbar.contact_target === "external" && settings.topbar.contact_url ? (
                <a href={settings.topbar.contact_url} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
                  {settings.topbar.contact_label}
                </a>
              ) : (
                <a href="#contato" className="hover:text-zinc-900">
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
          <button
            type="button"
            className="sm:hidden h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center"
            aria-label="Menu"
          >
            <div className="w-5 space-y-1">
              <div className="h-0.5 bg-zinc-900" />
              <div className="h-0.5 bg-zinc-900" />
              <div className="h-0.5 bg-zinc-900" />
            </div>
          </button>

          <Link href={`/loja/${storeTyped.slug}`} className="flex items-center gap-3 min-w-0">
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

          <form action={buildSearchHref(storeTyped.slug, "")} method="get" className="flex-1 max-w-xl">
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
                <input type="hidden" name="next" value={`/loja/${storeTyped.slug}`} />
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
            <a href="#" className="hidden sm:flex h-10 w-10 rounded-lg border border-zinc-200 bg-white items-center justify-center" aria-label="Favoritos">
              <IconHeart className="h-5 w-5" />
            </a>
            <CartIndicator storeSlug={storeTyped.slug} />
          </div>
        </div>

        {heroItems.length > 0 ? (
          <div className="max-w-6xl mx-auto px-4 pb-4">
            <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
              <div className="flex overflow-x-auto snap-x snap-mandatory">
                {heroItems.map((b) => {
                  const href = b.link_url
                  const isExternal = href ? href.startsWith("http://") || href.startsWith("https://") : false
                  const inner = (
                    <div className="h-40 md:h-56">
                      <img src={b.image_url} alt={b.title ?? storeTyped.name} className="h-full w-full object-cover" />
                    </div>
                  )
                  if (!href) {
                    return (
                      <div key={b.id} className="snap-start shrink-0 w-full">
                        {inner}
                      </div>
                    )
                  }
                  return isExternal ? (
                    <a key={b.id} href={href} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-full block">
                      {inner}
                    </a>
                  ) : (
                    <Link key={b.id} href={href} className="snap-start shrink-0 w-full block">
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ) : storeTyped.banner_url ? (
          <div className="max-w-6xl mx-auto px-4 pb-4">
            <div className="h-40 md:h-56 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
              <img src={storeTyped.banner_url} alt="Banner" className="h-full w-full object-cover" />
            </div>
          </div>
        ) : null}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div id="contato" />
        {storeTyped.about && <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 whitespace-pre-wrap">{storeTyped.about}</div>}

        {q && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold tracking-wide">RESULTADOS</div>
              <div className="text-sm text-zinc-600">Busca por “{q}”</div>
            </div>
            <Link href={`/loja/${storeTyped.slug}`} className="text-sm underline underline-offset-4 text-zinc-700">
              Limpar busca
            </Link>
          </div>
        )}

        <section className="space-y-6">
          {!q && <h2 className="text-2xl font-semibold tracking-wide">{settings.sections.launches_title}</h2>}

          {lancamentos.length === 0 ? (
            <div className="border border-zinc-200 rounded-xl p-10 text-center text-zinc-600 bg-white">Nenhum produto disponível no momento.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {lancamentos.map((p) => (
                <div key={p.id} className="bg-white">
                  <Link href={`/loja/${storeTyped.slug}/produto/${p.id}`} className="block border border-zinc-200">
                    <div className="aspect-square bg-zinc-50">
                      {p.cover ? <img src={p.cover} alt={p.name} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                    </div>
                  </Link>

                  <div className="pt-4 pb-3 space-y-3">
                    <div className="text-center space-y-2">
                      <div className="text-sm font-medium tracking-wide uppercase line-clamp-2 min-h-[2.25rem]">{p.name}</div>
                      <div className="text-2xl font-semibold">R$ {formatBRL(p.price)}</div>
                      <div className="text-xs text-zinc-600">
                        <div>1x de R$ {formatBRL(p.price)}</div>
                        <div>R$ {formatBRL(p.price)} com PIX</div>
                      </div>
                    </div>

                    {settings.product_card.show_sizes && (
                      <div className="text-center text-xs text-zinc-600 tracking-widest whitespace-pre">{settings.product_card.sizes_text}</div>
                    )}

                    <div className="space-y-2">
                      <Link
                        href={`/loja/${storeTyped.slug}/produto/${p.id}`}
                        className="w-full inline-flex items-center justify-center h-11 bg-zinc-800 text-white text-sm font-medium"
                      >
                        {settings.product_card.look_label}
                      </Link>
                      <BuyButton
                        resellerId={storeTyped.reseller_id}
                        storeSlug={storeTyped.slug}
                        items={[{ product_id: p.id, qty: 1, base_cost: p.base_cost, reseller_margin: p.reseller_margin }]}
                        compact
                        className="w-full h-11 text-sm font-medium rounded-none"
                        label={settings.product_card.buy_label}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!q && promoItems.length > 0 && (
          <section className="space-y-4">
            {promoItems.map((b) => {
              const href = b.link_url
              const isExternal = href ? href.startsWith("http://") || href.startsWith("https://") : false
              const img = (
                <div className="h-32 md:h-44 border border-zinc-200 bg-zinc-50 overflow-hidden rounded-lg">
                  <img src={b.image_url} alt={b.title ?? storeTyped.name} className="h-full w-full object-cover" />
                </div>
              )
              if (!href) return <div key={b.id}>{img}</div>
              return isExternal ? (
                <a key={b.id} href={href} target="_blank" rel="noopener noreferrer" className="block">
                  {img}
                </a>
              ) : (
                <Link key={b.id} href={href} className="block">
                  {img}
                </Link>
              )
            })}
          </section>
        )}

        {!q && maisVendidos.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-wide">{settings.sections.best_sellers_title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {maisVendidos.map((p) => (
                <div key={p.id} className="bg-white">
                  <Link href={`/loja/${storeTyped.slug}/produto/${p.id}`} className="block border border-zinc-200">
                    <div className="aspect-square bg-zinc-50">
                      {p.cover ? <img src={p.cover} alt={p.name} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                    </div>
                  </Link>

                  <div className="pt-4 pb-3 space-y-3">
                    <div className="text-center space-y-2">
                      <div className="text-sm font-medium tracking-wide uppercase line-clamp-2 min-h-[2.25rem]">{p.name}</div>
                      <div className="text-2xl font-semibold">R$ {formatBRL(p.price)}</div>
                      <div className="text-xs text-zinc-600">
                        <div>1x de R$ {formatBRL(p.price)}</div>
                        <div>R$ {formatBRL(p.price)} com PIX</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href={`/loja/${storeTyped.slug}/produto/${p.id}`}
                        className="w-full inline-flex items-center justify-center h-11 bg-zinc-800 text-white text-sm font-medium"
                      >
                        {settings.product_card.look_label}
                      </Link>
                      <BuyButton
                        resellerId={storeTyped.reseller_id}
                        storeSlug={storeTyped.slug}
                        items={[{ product_id: p.id, qty: 1, base_cost: p.base_cost, reseller_margin: p.reseller_margin }]}
                        compact
                        className="w-full h-11 text-sm font-medium rounded-none"
                        label={settings.product_card.buy_label}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-600">
          © {new Date().getFullYear()} {storeTyped.name}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

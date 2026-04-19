export type VisualBanner = {
  id: string
  image_url: string
  link_url: string | null
  title: string | null
  enabled: boolean
  order: number
}

export type VisualSettings = {
  hero: {
    items: VisualBanner[]
  }
  promos: {
    items: VisualBanner[]
  }
  seo: {
    meta_title: string | null
    meta_description: string | null
    meta_keywords: string | null
    google_analytics_id: string | null
  }
}

export const visualSettingsDefaults: VisualSettings = {
  hero: { items: [] },
  promos: { items: [] },
  seo: {
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    google_analytics_id: null,
  },
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function asStringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null
  const s = v.trim()
  return s ? s : null
}

function asBool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback
}

function asNumber(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

function normalizeItems(input: unknown): VisualBanner[] {
  const arr = Array.isArray(input) ? input : []

  const items = arr
    .map((it, idx) => {
      const r = asRecord(it)
      if (!r) return null
      const id = asStringOrNull(r.id) ?? `b_${idx}_${Math.random().toString(36).slice(2)}`
      const image_url = asStringOrNull(r.image_url)
      if (!image_url) return null
      const link_url = asStringOrNull(r.link_url)
      const title = asStringOrNull(r.title)
      const enabled = asBool(r.enabled, true)
      const order = Math.trunc(asNumber(r.order, idx))
      return { id, image_url, link_url, title, enabled, order } satisfies VisualBanner
    })
    .filter((v): v is VisualBanner => Boolean(v))
    .sort((a, b) => a.order - b.order)
    .slice(0, 8)
    .map((it, idx) => ({ ...it, order: idx }))

  return items
}

export function normalizeVisualSettings(input: unknown): VisualSettings {
  const root = asRecord(input) ?? {}
  const heroRaw = asRecord(root.hero) ?? {}
  const promosRaw = asRecord(root.promos) ?? {}
  const seoRaw = asRecord(root.seo) ?? {}

  return {
    hero: { items: normalizeItems(heroRaw.items) },
    promos: { items: normalizeItems(promosRaw.items) },
    seo: {
      meta_title: asStringOrNull(seoRaw.meta_title),
      meta_description: asStringOrNull(seoRaw.meta_description),
      meta_keywords: asStringOrNull(seoRaw.meta_keywords),
      google_analytics_id: asStringOrNull(seoRaw.google_analytics_id),
    },
  }
}


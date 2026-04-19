export type StorefrontSettings = {
  topbar: {
    enabled: boolean
    message: string
    home_label: string
    contact_label: string
    contact_target: "anchor" | "external"
    contact_url: string
  }
  sections: {
    launches_title: string
    best_sellers_title: string
    launches_count: number
    best_sellers_enabled: boolean
    best_sellers_count: number
  }
  product_card: {
    show_sizes: boolean
    sizes_text: string
    look_label: string
    buy_label: string
  }
}

export const storefrontSettingsDefaults: StorefrontSettings = {
  topbar: {
    enabled: true,
    message: "Entrega em todo o Brasil • Compre com segurança",
    home_label: "Home",
    contact_label: "Fale conosco",
    contact_target: "anchor",
    contact_url: "",
  },
  sections: {
    launches_title: "LANÇAMENTOS",
    best_sellers_title: "MAIS VENDIDOS",
    launches_count: 8,
    best_sellers_enabled: true,
    best_sellers_count: 8,
  },
  product_card: {
    show_sizes: true,
    sizes_text: "P  M  G  GG",
    look_label: "Olhar",
    buy_label: "Comprar",
  },
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function asString(v: unknown, fallback: string) {
  return typeof v === "string" ? v : fallback
}

function asBool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback
}

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : Number.NaN
  if (!Number.isFinite(n)) return fallback
  const i = Math.trunc(n)
  return Math.min(Math.max(i, min), max)
}

export function isValidExternalUrl(url: string) {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeStorefrontSettings(input: unknown): StorefrontSettings {
  const root = asRecord(input) ?? {}
  const topbarRaw = asRecord(root.topbar) ?? {}
  const sectionsRaw = asRecord(root.sections) ?? {}
  const productCardRaw = asRecord(root.product_card) ?? {}

  const contact_target =
    topbarRaw.contact_target === "external" || topbarRaw.contact_target === "anchor"
      ? (topbarRaw.contact_target as "anchor" | "external")
      : storefrontSettingsDefaults.topbar.contact_target

  const contact_url = asString(topbarRaw.contact_url, storefrontSettingsDefaults.topbar.contact_url).trim()
  const safeContactUrl = contact_target === "external" ? contact_url : ""

  const normalized: StorefrontSettings = {
    topbar: {
      enabled: asBool(topbarRaw.enabled, storefrontSettingsDefaults.topbar.enabled),
      message: asString(topbarRaw.message, storefrontSettingsDefaults.topbar.message).trim() || storefrontSettingsDefaults.topbar.message,
      home_label: asString(topbarRaw.home_label, storefrontSettingsDefaults.topbar.home_label).trim() || storefrontSettingsDefaults.topbar.home_label,
      contact_label:
        asString(topbarRaw.contact_label, storefrontSettingsDefaults.topbar.contact_label).trim() ||
        storefrontSettingsDefaults.topbar.contact_label,
      contact_target,
      contact_url: safeContactUrl,
    },
    sections: {
      launches_title:
        asString(sectionsRaw.launches_title, storefrontSettingsDefaults.sections.launches_title).trim() ||
        storefrontSettingsDefaults.sections.launches_title,
      best_sellers_title:
        asString(sectionsRaw.best_sellers_title, storefrontSettingsDefaults.sections.best_sellers_title).trim() ||
        storefrontSettingsDefaults.sections.best_sellers_title,
      launches_count: clampInt(sectionsRaw.launches_count, storefrontSettingsDefaults.sections.launches_count, 1, 24),
      best_sellers_enabled: asBool(sectionsRaw.best_sellers_enabled, storefrontSettingsDefaults.sections.best_sellers_enabled),
      best_sellers_count: clampInt(sectionsRaw.best_sellers_count, storefrontSettingsDefaults.sections.best_sellers_count, 1, 24),
    },
    product_card: {
      show_sizes: asBool(productCardRaw.show_sizes, storefrontSettingsDefaults.product_card.show_sizes),
      sizes_text:
        asString(productCardRaw.sizes_text, storefrontSettingsDefaults.product_card.sizes_text).trim() ||
        storefrontSettingsDefaults.product_card.sizes_text,
      look_label:
        asString(productCardRaw.look_label, storefrontSettingsDefaults.product_card.look_label).trim() ||
        storefrontSettingsDefaults.product_card.look_label,
      buy_label:
        asString(productCardRaw.buy_label, storefrontSettingsDefaults.product_card.buy_label).trim() ||
        storefrontSettingsDefaults.product_card.buy_label,
    },
  }

  if (normalized.topbar.enabled && normalized.topbar.contact_target === "external") {
    if (!normalized.topbar.contact_url || !isValidExternalUrl(normalized.topbar.contact_url)) {
      return {
        ...normalized,
        topbar: {
          ...normalized.topbar,
          contact_target: "anchor",
          contact_url: "",
        },
      }
    }
  }

  return normalized
}

import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

type CheckoutItem = { product_id?: string; qty?: number }

type SuperFreteQuote = {
  name?: string
  service?: string | number
  price?: number | string
  delivery_time?: number | string
  deliveryTime?: number | string
}

function getSuperFreteBaseUrl() {
  const env = (process.env.SUPERFRETE_ENV ?? "").toLowerCase()
  return env === "production" ? "https://api.superfrete.com" : "https://sandbox.superfrete.com"
}

function getSuperFreteUserAgent() {
  return process.env.SUPERFRETE_USER_AGENT?.trim() || "DropshippingMilionario (contato@dropshippingmilionario.com)"
}

function createAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

function serviceNameFromId(serviceId: number): string | null {
  if (serviceId === 1) return "PAC"
  if (serviceId === 2) return "SEDEX"
  return null
}

function parseQuotes(data: unknown): Array<{ name: string; price: number; estimatedDays?: number }> {
  const candidates: unknown[] =
    Array.isArray(data) ? data :
    data && typeof data === "object" && "data" in data && Array.isArray((data as { data?: unknown }).data) ? ((data as { data: unknown[] }).data) :
    data && typeof data === "object" && "services" in data && Array.isArray((data as { services?: unknown }).services) ? ((data as { services: unknown[] }).services) :
    []

  const out: Array<{ name: string; price: number; estimatedDays?: number }> = []
  for (const raw of candidates) {
    const r = raw as SuperFreteQuote
    const name =
      typeof r.name === "string" ? r.name :
      typeof r.service === "string" ? r.service :
      typeof r.service === "number" && Number.isFinite(r.service) ? (serviceNameFromId(r.service) ?? `Serviço ${r.service}`) :
      null
    const priceNum = typeof r.price === "number" ? r.price : typeof r.price === "string" ? Number(r.price) : Number.NaN
    const daysRaw = r.delivery_time ?? r.deliveryTime
    const daysNum = typeof daysRaw === "number" ? daysRaw : typeof daysRaw === "string" ? Number(daysRaw) : Number.NaN
    if (!name || !Number.isFinite(priceNum)) continue
    out.push({ name, price: Math.round(priceNum * 100) / 100, estimatedDays: Number.isFinite(daysNum) ? Math.trunc(daysNum) : undefined })
  }
  return out
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const destinationZipRaw = typeof body.to_postal_code === "string" ? body.to_postal_code : typeof body.destinationZip === "string" ? body.destinationZip : ""
    const destinationZip = destinationZipRaw.replace(/\D/g, "")
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : []

    if (!destinationZip || destinationZip.length !== 8 || items.length === 0) {
      return NextResponse.json(
        { error: "CEP de destino e itens são obrigatórios." },
        { status: 400 }
      )
    }

    const token = process.env.SUPERFRETE_TOKEN?.trim()
    const origin = (process.env.SUPPLIER_ORIGIN_POSTAL_CODE ?? "").replace(/\D/g, "")
    const services = process.env.SUPERFRETE_SERVICES?.trim() || "1,2"

    const missing: string[] = []
    if (!token) missing.push("SUPERFRETE_TOKEN")
    if (!origin || origin.length !== 8) missing.push("SUPPLIER_ORIGIN_POSTAL_CODE")

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "Frete indisponível no momento. Configuração do provedor de frete ausente no servidor.",
          code: "SHIPPING_PROVIDER_NOT_CONFIGURED",
          missing,
        },
        { status: 503 }
      )
    }

    const weight = Number(process.env.SUPERFRETE_DEFAULT_WEIGHT_KG ?? "0.3")
    const height = Number(process.env.SUPERFRETE_DEFAULT_HEIGHT_CM ?? "4")
    const width = Number(process.env.SUPERFRETE_DEFAULT_WIDTH_CM ?? "16")
    const length = Number(process.env.SUPERFRETE_DEFAULT_LENGTH_CM ?? "20")

    const qtyByProductId = new Map<string, number>()
    for (const it of items) {
      const productId = typeof it.product_id === "string" ? it.product_id : ""
      const qty = Math.max(Math.trunc(Number(it.qty ?? 1)), 1)
      if (!productId) continue
      qtyByProductId.set(productId, (qtyByProductId.get(productId) ?? 0) + qty)
    }

    const hasProductIds = qtyByProductId.size > 0

    let products: Array<{ quantity: number; weight: number; height: number; width: number; length: number }> = []
    if (!hasProductIds) {
      products = items.map((it) => ({
        quantity: Math.max(Math.trunc(Number(it.qty ?? 1)), 1),
        weight,
        height,
        width,
        length,
      }))
    } else {
      const supabase = createAnonSupabase()
      if (!supabase) {
        return NextResponse.json(
          { error: "Frete indisponível no momento.", code: "SERVER_NOT_CONFIGURED" },
          { status: 503 }
        )
      }

      const productIds = Array.from(qtyByProductId.keys())
      const { data, error } = await supabase
        .from("products")
        .select("id,weight_kg,length_cm,width_cm,height_cm")
        .in("id", productIds)

      if (error) {
        return NextResponse.json({ error: "Erro ao calcular o frete." }, { status: 500 })
      }

      const dimsById = new Map<string, { weight: number; length: number; width: number; height: number }>()
      for (const row of (data ?? []) as Array<Record<string, unknown>>) {
        const id = typeof row.id === "string" ? row.id : ""
        if (!id) continue
        const w = Number(row.weight_kg)
        const l = Number(row.length_cm)
        const wi = Number(row.width_cm)
        const h = Number(row.height_cm)
        dimsById.set(id, {
          weight: Number.isFinite(w) && w > 0 ? w : weight,
          length: Number.isFinite(l) && l > 0 ? l : length,
          width: Number.isFinite(wi) && wi > 0 ? wi : width,
          height: Number.isFinite(h) && h > 0 ? h : height,
        })
      }

      const missingProductIds = productIds.filter((id) => !dimsById.has(id))
      if (missingProductIds.length > 0) {
        return NextResponse.json(
          { error: "Não foi possível calcular o frete para todos os itens do carrinho.", code: "SHIPPING_PRODUCTS_NOT_FOUND", missingProductIds },
          { status: 400 }
        )
      }

      products = productIds.map((id) => {
        const dims = dimsById.get(id)!
        return {
          quantity: qtyByProductId.get(id)!,
          weight: dims.weight,
          height: dims.height,
          width: dims.width,
          length: dims.length,
        }
      })
    }

    const res = await fetch(`${getSuperFreteBaseUrl()}/api/v0/calculator`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": getSuperFreteUserAgent(),
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: { postal_code: origin },
        to: { postal_code: destinationZip },
        services,
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: 0,
          use_insurance_value: false,
        },
        products,
      }),
    })

    const text = await res.text()
    const data = text ? (JSON.parse(text) as unknown) : null
    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao calcular o frete." }, { status: 500 })
    }

    const options = parseQuotes(data)
    return NextResponse.json({ success: true, options })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Erro ao calcular o frete." },
      { status: 500 }
    )
  }
}

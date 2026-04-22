import { NextResponse } from "next/server"

type CheckoutItem = { qty?: number }

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

function parseQuotes(data: unknown): Array<{ name: string; price: number; estimatedDays?: number }> {
  const candidates: unknown[] =
    Array.isArray(data) ? data :
    data && typeof data === "object" && "data" in data && Array.isArray((data as { data?: unknown }).data) ? ((data as { data: unknown[] }).data) :
    data && typeof data === "object" && "services" in data && Array.isArray((data as { services?: unknown }).services) ? ((data as { services: unknown[] }).services) :
    []

  const out: Array<{ name: string; price: number; estimatedDays?: number }> = []
  for (const raw of candidates) {
    const r = raw as SuperFreteQuote
    const name = typeof r.name === "string" ? r.name : typeof r.service === "string" ? r.service : null
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

    if (token && origin && origin.length === 8) {
      const weight = Number(process.env.SUPERFRETE_DEFAULT_WEIGHT_KG ?? "0.3")
      const height = Number(process.env.SUPERFRETE_DEFAULT_HEIGHT_CM ?? "4")
      const width = Number(process.env.SUPERFRETE_DEFAULT_WIDTH_CM ?? "16")
      const length = Number(process.env.SUPERFRETE_DEFAULT_LENGTH_CM ?? "20")

      const products = items.map((it) => ({
        quantity: Math.max(Math.trunc(Number(it.qty ?? 1)), 1),
        weight,
        height,
        width,
        length,
      }))

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
    }

    const baseShipping = 15.9
    const extraPerItem = 2.5
    const totalShipping = baseShipping + (items.length - 1) * extraPerItem

    return NextResponse.json({
      success: true,
      options: [
        { name: "PAC (Padrão)", price: Math.round(totalShipping * 100) / 100, estimatedDays: 7 },
        { name: "SEDEX (Expresso)", price: Math.round(totalShipping * 1.8 * 100) / 100, estimatedDays: 3 },
      ],
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Erro ao calcular o frete." },
      { status: 500 }
    )
  }
}

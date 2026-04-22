import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/server"

type AsaasWebhookPayload = {
  event?: string
  payment?: {
    id?: string
    status?: string
    externalReference?: string
  }
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export async function POST(request: Request) {
  const token = process.env.ASAAS_WEBHOOK_TOKEN?.trim()
  if (token) {
    const incoming = request.headers.get("asaas-access-token")?.trim()
    if (!incoming || incoming !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 })
  }

  let payload: AsaasWebhookPayload | null = null
  try {
    payload = (await request.json()) as AsaasWebhookPayload
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const event = payload?.event ?? ""
  const paymentId = payload?.payment?.id ?? null
  const externalReference = payload?.payment?.externalReference ?? null
  if (!paymentId && !externalReference) {
    return NextResponse.json({ ok: true })
  }

  const nextStatus =
    event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED"
      ? "Pago"
      : event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED" || event === "PAYMENT_CANCELED" || event === "PAYMENT_REFUNDED"
        ? "Cancelado"
        : null

  if (!nextStatus) {
    return NextResponse.json({ ok: true })
  }

  if (paymentId) {
    await admin.from("orders").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("asaas_transaction_id", paymentId)
    return NextResponse.json({ ok: true })
  }

  if (externalReference && isUuid(externalReference)) {
    await admin.from("orders").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", externalReference)
  }

  return NextResponse.json({ ok: true })
}


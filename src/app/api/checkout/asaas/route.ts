import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/server"
import { decryptSecret } from "@/lib/secret"
import { AsaasError, createPayment, getOrCreateCustomer, getPixQrCode, type PixQrCodeResponse } from "@/lib/asaas"

type CheckoutItem = { product_id: string; qty: number; base_cost: number; reseller_margin: number }

export async function POST(request: Request) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: "Configuração do servidor ausente." }, { status: 500 })
    }

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 })
    }
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : null
    const shipping_cost = typeof body.shipping_cost === "number" ? body.shipping_cost : 0
    const payment_method = typeof body.payment_method === "string" ? body.payment_method : "pix"
    const installmentsRaw = typeof body.installments === "number" ? body.installments : 1
    const installments = Math.min(Math.max(Math.trunc(installmentsRaw), 1), 3)
    const reseller_id = typeof body.reseller_id === "string" ? body.reseller_id : null
    const store_slug = typeof body.store_slug === "string" ? body.store_slug : null
    const customer_name = typeof body.customer_name === "string" ? body.customer_name : null
    const customer_cpf = typeof body.customer_cpf === "string" ? body.customer_cpf : null
    const customer_email = typeof body.customer_email === "string" ? body.customer_email : null

    if (!items || items.length === 0 || !reseller_id || !store_slug || !customer_name || !customer_cpf) {
      return NextResponse.json({ error: "Dados insuficientes para iniciar o checkout." }, { status: 400 })
    }

    const { data: store } = await admin
      .from("reseller_stores")
      .select("reseller_id,slug,is_published")
      .eq("slug", store_slug)
      .maybeSingle()

    if (!store || store.reseller_id !== reseller_id || store.is_published !== true) {
      return NextResponse.json({ error: "Loja inválida ou indisponível." }, { status: 400 })
    }

    const { data: supplier } = await admin.from("profiles").select("asaas_wallet_id").eq("role", "supplier").maybeSingle()
    const supplierWalletId = supplier?.asaas_wallet_id ?? null
    if (!supplierWalletId) {
      return NextResponse.json({ error: "Fornecedor ainda não configurou o Asaas." }, { status: 400 })
    }

    const { data: reseller } = await admin
      .from("profiles")
      .select("asaas_api_key_encrypted")
      .eq("id", reseller_id)
      .maybeSingle()

    const resellerApiKeyEncrypted = reseller?.asaas_api_key_encrypted ?? null
    if (!resellerApiKeyEncrypted) {
      return NextResponse.json({ error: "Revendedor ainda não configurou o Asaas." }, { status: 400 })
    }

    let resellerApiKey = ""
    try {
      resellerApiKey = decryptSecret(resellerApiKeyEncrypted)
    } catch {
      return NextResponse.json({ error: "Falha ao ler configuração de pagamentos." }, { status: 500 })
    }

    const baseCostTotal = items.reduce((acc, it) => acc + Number(it.base_cost || 0) * Number(it.qty || 0), 0)
    const resellerMarginTotal = items.reduce((acc, it) => acc + Number(it.reseller_margin || 0) * Number(it.qty || 0), 0)
    const shippingCost = Number(shipping_cost || 0)
    const supplierValue = baseCostTotal + shippingCost
    const totalValue = baseCostTotal + resellerMarginTotal + shippingCost

    const round2 = (n: number) => Math.round(n * 100) / 100
    const supplierFixed = round2(supplierValue)
    const total = round2(totalValue)

    let customerId = ""
    try {
      customerId = await getOrCreateCustomer(resellerApiKey, {
        name: customer_name,
        cpfCnpj: customer_cpf,
        email: customer_email ?? undefined,
      })
    } catch (e) {
      if (e instanceof AsaasError) {
        return NextResponse.json({ error: e.message }, { status: 400 })
      }
      return NextResponse.json({ error: "Erro ao validar/criar cliente no Asaas." }, { status: 500 })
    }

    const dueDate = new Date().toISOString().slice(0, 10)

    const billingType = payment_method === "card" ? "CREDIT_CARD" : "PIX"
    const orderPaymentMethod = billingType === "CREDIT_CARD" ? "Cartão" : "PIX"

    const { data: createdOrder, error: orderCreateError } = await admin
      .from("orders")
      .insert({
        reseller_id,
        customer_name,
        total_amount: total,
        base_cost_total: round2(baseCostTotal),
        reseller_margin_total: round2(resellerMarginTotal),
        shipping_cost: round2(shippingCost),
        status: "Pendente Pagamento",
        payment_method: orderPaymentMethod,
      })
      .select("id")
      .single()

    if (orderCreateError || !createdOrder) {
      return NextResponse.json({ error: "Erro ao criar pedido." }, { status: 500 })
    }

    let payment
    try {
      payment = await createPayment(resellerApiKey, {
        customer: customerId,
        billingType,
        value: total,
        installmentCount: billingType === "CREDIT_CARD" ? installments : undefined,
        dueDate,
        description: `Pedido ${createdOrder.id} - ${store_slug}`,
        externalReference: createdOrder.id,
        split: [{ walletId: supplierWalletId, fixedValue: supplierFixed }],
      })
    } catch (e) {
      await admin.from("orders").update({ status: "Erro Pagamento", updated_at: new Date().toISOString() }).eq("id", createdOrder.id)
      if (e instanceof AsaasError) {
        return NextResponse.json({ error: e.message }, { status: 400 })
      }
      return NextResponse.json({ error: "Erro ao criar cobrança no Asaas." }, { status: 500 })
    }

    await admin
      .from("orders")
      .update({
        asaas_transaction_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", createdOrder.id)

    let pix: PixQrCodeResponse | null = null
    if (billingType === "PIX") {
      try {
        pix = await getPixQrCode(resellerApiKey, payment.id)
      } catch (e) {
        if (e instanceof AsaasError) {
          return NextResponse.json({ error: e.message }, { status: 400 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transação criada no Asaas.",
      orderId: createdOrder.id,
      transactionId: payment.id,
      invoiceUrl: payment.invoiceUrl ?? null,
      pix,
    })
  } catch (error: unknown) {
    const safe =
      error instanceof AsaasError
        ? { name: error.name, status: error.status, code: error.code, message: error.message }
        : error instanceof Error
          ? { name: error.name, message: error.message }
          : { message: String(error) }
    console.error("asaas checkout error", safe)
    return NextResponse.json({ error: "Erro ao processar transação no Asaas." }, { status: 500 })
  }
}

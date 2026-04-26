"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useStorefrontCart, type StorefrontCartItem } from "@/lib/storefront-cart"

type StorefrontProduct = {
  id: string
  name: string
  sku: string
  images: string[] | null
}

type ResellerProductRow = {
  product_id: string
  product: StorefrontProduct | StorefrontProduct[] | null
}

type ShippingOption = {
  name: string
  price: number
  estimatedDays?: number
}

type PixQrCode = {
  encodedImage: string
  payload: string
  expirationDate?: string
}

function formatBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

function toCents(value: number) {
  return Math.round((Number(value) || 0) * 100)
}

function formatCentsBRL(cents: number) {
  return formatBRL((Number(cents) || 0) / 100)
}

function splitInstallments(totalCents: number, count: 1 | 2 | 3) {
  const safeTotal = Math.max(0, Math.trunc(totalCents))
  const base = Math.floor(safeTotal / count)
  const remainder = safeTotal - base * count
  const parts = Array.from({ length: count }, (_, idx) => base + (idx < remainder ? 1 : 0))
  return parts as number[]
}

function installmentsLabel(totalCents: number, count: 1 | 2 | 3) {
  const parts = splitInstallments(totalCents, count)
  const first = parts[0] ?? 0
  const allEqual = parts.every((p) => p === first)
  if (allEqual) return `${count}x de R$ ${formatCentsBRL(first)}`
  const desc = parts.map((p, idx) => `${idx + 1}ª R$ ${formatCentsBRL(p)}`).join(" + ")
  return `${count}x: ${desc}`
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function cartItemUnitPrice(it: StorefrontCartItem) {
  const base = Number(it.base_cost) || 0
  const margin = Number(it.reseller_margin) || 0
  return base + margin
}

function cartSubtotal(items: StorefrontCartItem[]) {
  return items.reduce((acc, it) => acc + cartItemUnitPrice(it) * (Number(it.qty) || 0), 0)
}

export function StorefrontCheckoutClient(props: { storeSlug: string; resellerId: string; initialCustomerEmail: string | null }) {
  const cart = useStorefrontCart(props.storeSlug)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [productsById, setProductsById] = useState<Record<string, StorefrontProduct>>({})
  const [productsError, setProductsError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState(props.initialCustomerEmail ?? "")
  const [cep, setCep] = useState("")

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingIdx, setSelectedShippingIdx] = useState<number | null>(null)
  const selectedShipping = selectedShippingIdx != null ? shippingOptions[selectedShippingIdx] ?? null : null

  const [isShippingLoading, setIsShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [installments, setInstallments] = useState<1 | 2 | 3>(1)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [pixQrCode, setPixQrCode] = useState<PixQrCode | null>(null)
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null)

  const isCartValid = Boolean(cart.reseller_id || props.resellerId) && cart.items.length > 0

  const subtotal = useMemo(() => cartSubtotal(cart.items), [cart.items])
  const shippingCost = selectedShipping ? Number(selectedShipping.price) || 0 : 0
  const total = subtotal + shippingCost
  const totalCents = useMemo(() => toCents(total), [total])

  useEffect(() => {
    const ids = cart.items.map((it) => it.product_id).filter(Boolean)
    if (ids.length === 0) {
      setProductsById({})
      setProductsError(null)
      return
    }

    let cancelled = false
    async function run() {
      setProductsError(null)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("reseller_products")
          .select("product_id,product:products(id,name,sku,images)")
          .eq("reseller_id", props.resellerId)
          .eq("is_active", true)
          .in("product_id", ids)

        if (cancelled) return
        if (error) throw error

        const rows = (data ?? []) as unknown as ResellerProductRow[]
        const next: Record<string, StorefrontProduct> = {}
        for (const row of rows) {
          const rawProduct = Array.isArray(row.product) ? row.product[0] : row.product
          if (!rawProduct || !rawProduct.id) continue
          next[row.product_id] = rawProduct as StorefrontProduct
        }
        setProductsById(next)
      } catch {
        setProductsError("Não foi possível carregar detalhes dos produtos.")
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [cart.updated_at, cart.items, props.resellerId])

  useEffect(() => {
    if (cart.items.length === 0) {
      setStep(1)
      setShippingOptions([])
      setSelectedShippingIdx(null)
      setShippingError(null)
      setInvoiceUrl(null)
      setPixQrCode(null)
      setPaymentError(null)
      setPaymentSuccessMessage(null)
    }
  }, [cart.items.length])

  function goToStep(next: 1 | 2 | 3) {
    if (!isCartValid) return
    if (next === 2 && !canContinueFromStep1) return
    if (next === 3 && !canContinueFromStep2) return
    setPaymentError(null)
    setPaymentSuccessMessage(null)
    setInvoiceUrl(null)
    setPixQrCode(null)
    setStep(next)
  }

  const cpfDigits = onlyDigits(cpf)
  const cepDigits = onlyDigits(cep)
  const canContinueFromStep1 = isCartValid && customerName.trim().length >= 2 && cpfDigits.length === 11 && email.trim().includes("@") && cepDigits.length === 8
  const canContinueFromStep2 = isCartValid && shippingOptions.length > 0 && selectedShipping != null
  const isShippingUnavailable = Boolean(shippingError && shippingError.toLowerCase().includes("frete indisponível"))

  async function fetchShipping() {
    setIsShippingLoading(true)
    setShippingError(null)
    setShippingOptions([])
    setSelectedShippingIdx(null)
    try {
      const res = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to_postal_code: cepDigits,
          items: cart.items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
        }),
      })

      const data = (await res.json().catch(() => null)) as { options?: ShippingOption[]; error?: string; code?: string } | null
      if (!res.ok) {
        if (res.status === 503 || data?.code === "SHIPPING_PROVIDER_NOT_CONFIGURED") {
          setShippingError("Frete indisponível no momento.")
          return
        }
        setShippingError(data?.error || "Não foi possível calcular o frete.")
        return
      }

      const options = Array.isArray(data?.options) ? data!.options : []
      if (options.length === 0) {
        setShippingError("Nenhuma opção de frete disponível.")
        return
      }
      setShippingOptions(options)
      setSelectedShippingIdx(0)
    } catch {
      setShippingError("Não foi possível calcular o frete.")
    } finally {
      setIsShippingLoading(false)
    }
  }

  async function startPayment() {
    setIsPaymentLoading(true)
    setPaymentError(null)
    setInvoiceUrl(null)
    setPixQrCode(null)
    setPaymentSuccessMessage(null)
    try {
      if (!selectedShipping) {
        setPaymentError("Selecione uma opção de frete.")
        return
      }

      const reseller_id = cart.reseller_id || props.resellerId
      const res = await fetch("/api/checkout/asaas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          shipping_cost: Number(selectedShipping.price) || 0,
          store_slug: props.storeSlug,
          reseller_id,
          customer_name: customerName.trim(),
          customer_cpf: cpfDigits,
          customer_email: email.trim() || null,
          payment_method: paymentMethod,
          installments: paymentMethod === "card" ? installments : 1,
        }),
      })

      const data = (await res.json().catch(() => null)) as {
        invoiceUrl?: string | null
        error?: string
        message?: string
        pix?: PixQrCode | null
      } | null
      if (!res.ok) {
        setPaymentError(data?.error || "Não foi possível iniciar o pagamento.")
        return
      }

      const url = typeof data?.invoiceUrl === "string" && data.invoiceUrl ? data.invoiceUrl : null
      setPaymentSuccessMessage(data?.message || "Cobrança criada com sucesso.")
      setInvoiceUrl(url)
      if (paymentMethod === "pix" && data?.pix && typeof data.pix.encodedImage === "string" && typeof data.pix.payload === "string") {
        setPixQrCode(data.pix)
      }
      if (url) {
        const opened = window.open(url, "_blank", "noopener,noreferrer")
        if (!opened) {
          window.location.href = url
        }
      }
    } catch {
      setPaymentError("Não foi possível iniciar o pagamento.")
    } finally {
      setIsPaymentLoading(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="border border-zinc-200 bg-white rounded-xl p-8 text-center">
        <div className="text-xl font-semibold">Seu carrinho está vazio</div>
        <p className="mt-2 text-sm text-zinc-600">Volte para a loja e adicione itens antes de finalizar.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/loja/${props.storeSlug}`} className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg">
            Voltar para a loja
          </Link>
          <Link href={`/loja/${props.storeSlug}/carrinho`} className="inline-flex items-center justify-center h-11 px-5 border border-zinc-200 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50">
            Ver carrinho
          </Link>
        </div>
      </div>
    )
  }

  if (!isCartValid) {
    return (
      <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-6" role="alert">
        Não foi possível iniciar o checkout com este carrinho. Volte para a loja e adicione os produtos novamente.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <section className="space-y-4">
        {productsError && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm" role="alert">
            {productsError}
          </div>
        )}

        <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
            <div className="font-semibold">Checkout</div>
            <div className="text-xs text-zinc-600">Etapa {step} de 3</div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => goToStep(1)} className={step === 1 ? "font-semibold" : "text-zinc-600 hover:text-zinc-900"}>
                Cliente
              </button>
              <span className="text-zinc-400">/</span>
              <button type="button" onClick={() => goToStep(2)} className={step === 2 ? "font-semibold" : "text-zinc-600 hover:text-zinc-900"} disabled={!canContinueFromStep1}>
                Frete
              </button>
              <span className="text-zinc-400">/</span>
              <button type="button" onClick={() => goToStep(3)} className={step === 3 ? "font-semibold" : "text-zinc-600 hover:text-zinc-900"} disabled={!canContinueFromStep2}>
                Pagamento
              </button>
            </div>

            {step === 1 && (
              <div className="mt-6 space-y-5">
                <div className="grid gap-2">
                  <label htmlFor="customer_name" className="text-sm font-medium text-zinc-800">
                    Nome completo
                  </label>
                  <input
                    id="customer_name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="customer_cpf" className="text-sm font-medium text-zinc-800">
                    CPF
                  </label>
                  <input
                    id="customer_cpf"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                  />
                  <div className="text-xs text-zinc-500">Somente números. Ex.: 12345678900</div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="customer_email" className="text-sm font-medium text-zinc-800">
                    E-mail
                  </label>
                  <input
                    id="customer_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="customer_cep" className="text-sm font-medium text-zinc-800">
                    CEP
                  </label>
                  <input
                    id="customer_cep"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    inputMode="numeric"
                    placeholder="00000-000"
                    className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/loja/${props.storeSlug}/carrinho`}
                    className="inline-flex items-center justify-center h-11 px-5 border border-zinc-200 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50"
                  >
                    Voltar ao carrinho
                  </Link>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    disabled={!canContinueFromStep1}
                    className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6 space-y-5">
                {shippingError && (
                  <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm" role="alert">
                    {shippingError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="grid gap-2 flex-1">
                    <label htmlFor="customer_cep_step2" className="text-sm font-medium text-zinc-800">
                      CEP
                    </label>
                    <input
                      id="customer_cep_step2"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      inputMode="numeric"
                      placeholder="00000-000"
                      className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchShipping}
                    disabled={isShippingLoading || cepDigits.length !== 8}
                    className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    {isShippingLoading ? "Calculando..." : "Calcular frete"}
                  </button>
                </div>

                {shippingOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Opções</div>
                    <div className="space-y-2">
                      {shippingOptions.map((opt, idx) => (
                        <label key={opt.name + idx} className="flex items-center justify-between gap-4 border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="radio"
                              name="shipping"
                              checked={selectedShippingIdx === idx}
                              onChange={() => setSelectedShippingIdx(idx)}
                              className="h-4 w-4"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{opt.name}</div>
                              <div className="text-xs text-zinc-600">
                                {typeof opt.estimatedDays === "number" ? `Prazo estimado: ${opt.estimatedDays} dia(s)` : "Prazo informado no pagamento"}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold whitespace-nowrap">R$ {formatBRL(Number(opt.price) || 0)}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center justify-center h-11 px-5 border border-zinc-200 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    disabled={!canContinueFromStep2}
                    className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-6 space-y-5">
                {paymentError && (
                  <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm" role="alert">
                    {paymentError}
                  </div>
                )}
                {paymentSuccessMessage && (
                  <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg px-4 py-3 text-sm" role="status" aria-live="polite">
                    {paymentSuccessMessage}
                    {invoiceUrl && (
                      <span className="ml-2">
                        <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                          Abrir pagamento
                        </a>
                      </span>
                    )}
                  </div>
                )}

                {paymentMethod === "pix" && pixQrCode && (
                  <div className="border border-zinc-200 bg-white rounded-xl p-5 space-y-4">
                    <div className="text-sm font-medium">Pague com PIX</div>
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                      <div className="border border-zinc-200 rounded-lg p-3 bg-white w-fit">
                        <img src={`data:image/png;base64,${pixQrCode.encodedImage}`} alt="QR Code PIX" className="w-[170px] h-[170px]" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-zinc-700">Escaneie o QR Code no app do seu banco, ou copie o código abaixo.</div>
                        <div className="grid gap-2">
                          <textarea
                            readOnly
                            value={pixQrCode.payload}
                            className="min-h-[110px] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(pixQrCode.payload)
                                setPaymentSuccessMessage("Código PIX copiado.")
                              } catch {
                                setPaymentSuccessMessage("Não foi possível copiar automaticamente. Selecione e copie o código.")
                              }
                            }}
                            className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg"
                          >
                            Copiar código PIX
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="text-sm font-medium">Forma de pagamento</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-50 flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">PIX</div>
                        <div className="text-xs text-zinc-600">Aprovação mais rápida</div>
                      </div>
                    </label>
                    <label className="border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-50 flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">Cartão</div>
                        <div className="text-xs text-zinc-600">Até 3x</div>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="grid gap-2">
                    <label htmlFor="installments" className="text-sm font-medium text-zinc-800">
                      Parcelas
                    </label>
                    <select
                      id="installments"
                      value={String(installments)}
                      onChange={(e) => setInstallments(Math.min(Math.max(Math.trunc(Number(e.target.value)), 1), 3) as 1 | 2 | 3)}
                      className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
                    >
                      <option value="1">{installmentsLabel(totalCents, 1)}</option>
                      <option value="2">{installmentsLabel(totalCents, 2)}</option>
                      <option value="3">{installmentsLabel(totalCents, 3)}</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    disabled={isPaymentLoading}
                    className="inline-flex items-center justify-center h-11 px-5 border border-zinc-200 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={startPayment}
                    disabled={isPaymentLoading}
                    className="inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    {isPaymentLoading ? "Criando pagamento..." : "Pagar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="border border-zinc-200 bg-white rounded-xl p-6 h-fit">
        <div className="text-lg font-semibold">Resumo</div>
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            {cart.items.map((it) => {
              const product = productsById[it.product_id]
              const unit = cartItemUnitPrice(it)
              return (
                <div key={it.product_id} className="flex items-start justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{product?.name ?? "Produto"}</div>
                    <div className="text-xs text-zinc-600">
                      {it.qty}x R$ {formatBRL(unit)}
                    </div>
                  </div>
                  <div className="font-medium whitespace-nowrap">R$ {formatBRL(unit * (Number(it.qty) || 0))}</div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-zinc-200 pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-medium">R$ {formatBRL(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Frete</span>
              <span className="font-medium">{selectedShipping ? `R$ ${formatBRL(shippingCost)}` : isShippingUnavailable ? "Frete indisponível" : "Selecione"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="font-semibold text-zinc-800">Total</span>
              <span className="font-semibold text-zinc-900">R$ {formatBRL(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

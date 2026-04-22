"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CSSProperties } from "react"

export function BuyButton({
  resellerId,
  storeSlug,
  items,
  compact = false,
  className,
  label,
}: {
  resellerId: string
  storeSlug: string
  items: Array<{ product_id: string; qty: number; base_cost: number; reseller_margin: number }>
  compact?: boolean
  className?: string
  label?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleBuy() {
    setIsLoading(true)
    setMessage(null)
    try {
      const name = window.prompt("Nome completo:")
      if (!name) {
        setIsLoading(false)
        return
      }
      const cpf = window.prompt("CPF/CNPJ:")
      if (!cpf) {
        setIsLoading(false)
        return
      }
      const email = window.prompt("E-mail (opcional):") || ""

      const cep = (window.prompt("CEP de entrega (somente números):") || "").replace(/\D/g, "")
      if (!cep || cep.length !== 8) {
        setIsLoading(false)
        setMessage("CEP inválido.")
        return
      }

      let shippingCost = 0
      try {
        const shipRes = await fetch("/api/checkout/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_postal_code: cep,
            items,
          }),
        })
        const shipData = await shipRes.json()
        if (!shipRes.ok) {
          setIsLoading(false)
          setMessage(shipData?.error || "Erro ao calcular frete.")
          return
        }
        const options: Array<{ name: string; price: number; estimatedDays?: number }> = Array.isArray(shipData?.options) ? shipData.options : []
        if (options.length === 0) {
          setIsLoading(false)
          setMessage("Nenhuma opção de frete disponível.")
          return
        }
        const list = options.map((o, i) => `${i + 1}) ${o.name} - R$ ${o.price.toFixed(2).replace(".", ",")}${o.estimatedDays ? ` (${o.estimatedDays} dias)` : ""}`).join("\n")
        const choiceRaw = window.prompt(`Escolha o frete:\n${list}\n\nDigite o número:`) || ""
        const idx = Number(choiceRaw) - 1
        if (!Number.isFinite(idx) || idx < 0 || idx >= options.length) {
          setIsLoading(false)
          setMessage("Frete não selecionado.")
          return
        }
        shippingCost = Number(options[idx]!.price) || 0
      } catch {
        setIsLoading(false)
        setMessage("Erro ao calcular frete.")
        return
      }

      const pm = (window.prompt("Forma de pagamento: PIX ou CARTAO?") || "").trim().toLowerCase()
      const payment_method = pm === "cartao" || pm === "card" ? "card" : "pix"
      let installments = 1
      if (payment_method === "card") {
        const instRaw = Number(window.prompt("Parcelas no cartão (1 a 3):") || "1")
        installments = Math.min(Math.max(Math.trunc(instRaw), 1), 3)
      }

      const res = await fetch("/api/checkout/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reseller_id: resellerId,
          store_slug: storeSlug,
          items,
          shipping_cost: shippingCost,
          shipping_address: null,
          customer_name: name,
          customer_cpf: cpf,
          customer_email: email || null,
          payment_method,
          installments,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data?.error || "Não foi possível iniciar o checkout.")
        return
      }

      if (data?.invoiceUrl) {
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer")
      }
      setMessage("Checkout iniciado.")
    } catch {
      setMessage("Não foi possível iniciar o checkout.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {(() => {
        const style = { backgroundColor: "var(--store-accent)" } as CSSProperties
        const baseClassName = compact ? "h-10 px-4 text-sm font-semibold text-black" : "w-full h-12 text-base font-semibold text-black"
        return (
          <Button type="button" onClick={handleBuy} disabled={isLoading} className={[baseClassName, className ?? ""].join(" ")} style={style}>
            {isLoading ? "Processando..." : label ?? "Comprar"}
          </Button>
        )
      })()}
      {message && (
        <p className={compact ? "text-xs text-zinc-600" : "text-sm text-zinc-600"} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )
}

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
      const res = await fetch("/api/checkout/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reseller_id: resellerId,
          store_slug: storeSlug,
          items,
          shipping_cost: 0,
          shipping_address: null,
          reseller_wallet_id: "wallet_reseller_placeholder",
          supplier_wallet_id: "wallet_supplier_placeholder",
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data?.error || "Não foi possível iniciar o checkout.")
        return
      }

      setMessage("Checkout iniciado (simulado).")
      console.log("Checkout payload/response:", data)
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CSSProperties } from "react"

export function BuyButton({
  resellerId,
  storeSlug,
  items,
}: {
  resellerId: string
  storeSlug: string
  items: Array<{ product_id: string; qty: number; base_cost: number; reseller_margin: number }>
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
    <div className="space-y-3">
      {(() => {
        const style = { backgroundColor: "var(--store-accent)" } as CSSProperties
        return (
      <Button
        type="button"
        onClick={handleBuy}
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold text-black"
        style={style}
      >
        {isLoading ? "Processando..." : "Comprar"}
      </Button>
        )
      })()}
      {message && (
        <p className="text-sm text-zinc-300" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import { BuyButton } from "./buy-button"

export function ProductAddToCart({
  resellerId,
  storeSlug,
  productId,
  baseCost,
  resellerMargin,
  label,
}: {
  resellerId: string
  storeSlug: string
  productId: string
  baseCost: number
  resellerMargin: number
  label?: string
}) {
  const [qtyRaw, setQtyRaw] = useState("1")
  const qty = useMemo(() => {
    const n = Number(qtyRaw)
    if (!Number.isFinite(n)) return 1
    return Math.min(Math.max(Math.trunc(n), 1), 999)
  }, [qtyRaw])

  function setQty(next: number) {
    const clamped = Math.min(Math.max(Math.trunc(next), 1), 999)
    setQtyRaw(String(clamped))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" onClick={() => setQty(qty - 1)} aria-label="Diminuir quantidade">
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          value={qtyRaw}
          onChange={(e) => setQtyRaw(e.target.value.replace(/[^\d]/g, ""))}
          className="h-10 text-center"
          aria-label="Quantidade"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => setQty(qty + 1)} aria-label="Aumentar quantidade">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <BuyButton
        resellerId={resellerId}
        storeSlug={storeSlug}
        items={[{ product_id: productId, qty, base_cost: baseCost, reseller_margin: resellerMargin }]}
        className="w-full h-12 text-base font-semibold rounded-none"
        label={label ?? "Adicionar ao carrinho"}
      />
    </div>
  )
}

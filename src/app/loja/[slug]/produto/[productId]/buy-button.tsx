"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CSSProperties } from "react"
import { addStorefrontCartItems, type StorefrontCartItem } from "@/lib/storefront-cart"

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
  items: StorefrontCartItem[]
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
      addStorefrontCartItems({ storeSlug, resellerId, items })
      setMessage("Adicionado ao carrinho.")
    } catch {
      setMessage("Não foi possível adicionar ao carrinho.")
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
            {isLoading ? "Adicionando..." : label ?? "Adicionar ao carrinho"}
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

export const AddToCartButton = BuyButton

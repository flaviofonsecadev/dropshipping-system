"use client"

import { useMemo } from "react"
import Link from "next/link"
import { getStorefrontCartTotalQty, useStorefrontCart } from "@/lib/storefront-cart"

function IconCart(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className} aria-hidden="true">
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-2 9H7L6 6Z" />
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" />
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M17.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  )
}

export function CartIndicator({
  storeSlug,
  className,
}: {
  storeSlug: string
  className?: string
}) {
  const cart = useStorefrontCart(storeSlug)
  const totalQty = useMemo(() => getStorefrontCartTotalQty(cart), [cart])

  return (
    <Link
      href={`/loja/${storeSlug}/carrinho`}
      className={["h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center relative", className ?? ""].join(" ")}
      aria-label="Carrinho"
    >
      <IconCart className="h-5 w-5" />
      <span className="absolute -right-1 -top-1 h-5 min-w-5 px-1 rounded-full bg-black text-white text-[11px] leading-5 text-center" aria-live="polite">
        {totalQty}
      </span>
    </Link>
  )
}

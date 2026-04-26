"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  removeStorefrontCartItem,
  setStorefrontCartItemQty,
  useStorefrontCart,
  type StorefrontCartItem,
} from "@/lib/storefront-cart"

type StorefrontProduct = {
  id: string
  name: string
  sku: string
  images: string[] | null
}

type ResellerProductRow = {
  product_id: string
  custom_margin: number | null
  product: StorefrontProduct | StorefrontProduct[] | null
}

function formatBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

function cartItemUnitPrice(it: StorefrontCartItem) {
  const base = Number(it.base_cost) || 0
  const margin = Number(it.reseller_margin) || 0
  return base + margin
}

export function StorefrontCartPageClient(props: { storeSlug: string; resellerId: string }) {
  const cart = useStorefrontCart(props.storeSlug)
  const [productsById, setProductsById] = useState<Record<string, StorefrontProduct>>({})
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  const total = useMemo(() => {
    return cart.items.reduce((acc, it) => acc + cartItemUnitPrice(it) * (Number(it.qty) || 0), 0)
  }, [cart.items])

  useEffect(() => {
    const ids = cart.items.map((it) => it.product_id).filter(Boolean)
    if (ids.length === 0) {
      setProductsById({})
      setProductsError(null)
      return
    }

    let cancelled = false
    async function run() {
      setIsLoadingProducts(true)
      setProductsError(null)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("reseller_products")
          .select("product_id,custom_margin,product:products(id,name,sku,images)")
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
        setProductsError("Não foi possível carregar os itens do carrinho.")
      } finally {
        if (!cancelled) setIsLoadingProducts(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [cart.updated_at, cart.items, props.resellerId])

  if (cart.items.length === 0) {
    return (
      <div className="border border-zinc-200 bg-white rounded-xl p-8 text-center">
        <div className="text-xl font-semibold">Seu carrinho está vazio</div>
        <p className="mt-2 text-sm text-zinc-600">Adicione produtos para continuar.</p>
        <Link href={`/loja/${props.storeSlug}`} className="mt-6 inline-flex items-center justify-center h-11 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-4">
        {productsError && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm" role="alert">
            {productsError}
          </div>
        )}

        <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold">Itens</div>
            {isLoadingProducts && <div className="text-xs text-zinc-600">Atualizando...</div>}
          </div>

          <div className="divide-y divide-zinc-200">
            {cart.items.map((it) => {
              const product = productsById[it.product_id]
              const cover = product && Array.isArray(product.images) ? product.images[0] : null
              const unit = cartItemUnitPrice(it)
              const subtotal = unit * (Number(it.qty) || 0)
              return (
                <div key={it.product_id} className="p-5 flex gap-4">
                  <div className="h-20 w-20 shrink-0 border border-zinc-200 bg-zinc-50 overflow-hidden rounded-lg">
                    {cover ? <img src={cover} alt={product?.name ?? it.product_id} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{product?.name ?? "Produto"}</div>
                        <div className="text-xs text-zinc-600 truncate">{product?.sku ? `SKU: ${product.sku}` : it.product_id}</div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">R$ {formatBRL(subtotal)}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-zinc-700" htmlFor={`qty-${it.product_id}`}>
                          Quantidade
                        </label>
                        <input
                          id={`qty-${it.product_id}`}
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) => setStorefrontCartItemQty({ storeSlug: props.storeSlug, productId: it.product_id, qty: Number(e.target.value) })}
                          className="h-10 w-20 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
                        />
                        <div className="text-xs text-zinc-600">R$ {formatBRL(unit)} / un</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStorefrontCartItem({ storeSlug: props.storeSlug, productId: it.product_id })}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <aside className="border border-zinc-200 bg-white rounded-xl p-6 h-fit">
        <div className="text-lg font-semibold">Resumo</div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-medium">R$ {formatBRL(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Frete</span>
            <span className="font-medium">Calculado no checkout</span>
          </div>
          <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
            <span className="text-zinc-800 font-semibold">Total</span>
            <span className="text-zinc-900 font-semibold">R$ {formatBRL(total)}</span>
          </div>
        </div>

        <Link
          href={`/loja/${props.storeSlug}/checkout`}
          className="mt-6 inline-flex items-center justify-center h-11 w-full bg-zinc-900 text-white text-sm font-medium rounded-lg"
        >
          Ir para o checkout
        </Link>

        <Link
          href={`/loja/${props.storeSlug}`}
          className="mt-3 inline-flex items-center justify-center h-11 w-full border border-zinc-200 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  )
}


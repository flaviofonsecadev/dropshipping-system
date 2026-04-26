"use client"

import { useSyncExternalStore } from "react"

export type StorefrontCartItem = {
  product_id: string
  qty: number
  base_cost: number
  reseller_margin: number
}

export type StorefrontCartState = {
  store_slug: string
  reseller_id: string | null
  items: StorefrontCartItem[]
  updated_at: number
}

const STORAGE_PREFIX = "dropsystem:storefront_cart:v1"

const carts = new Map<string, StorefrontCartState>()
const serverEmptyCarts = new Map<string, StorefrontCartState>()
const listeners = new Map<string, Set<() => void>>()
let storageListenerReady = false

function storageKey(storeSlug: string) {
  return `${STORAGE_PREFIX}:${storeSlug}`
}

function emptyCart(storeSlug: string, updated_at: number): StorefrontCartState {
  return { store_slug: storeSlug, reseller_id: null, items: [], updated_at }
}

function getServerEmptyCart(storeSlug: string) {
  const cached = serverEmptyCarts.get(storeSlug)
  if (cached) return cached
  const next = emptyCart(storeSlug, 0)
  serverEmptyCarts.set(storeSlug, next)
  return next
}

function getClientEmptyCart(storeSlug: string) {
  return emptyCart(storeSlug, Date.now())
}

function emit(storeSlug: string) {
  const set = listeners.get(storeSlug)
  if (!set) return
  for (const cb of set) cb()
}

function ensureStorageListener() {
  if (storageListenerReady) return
  storageListenerReady = true
  if (typeof window === "undefined") return
  window.addEventListener("storage", (e) => {
    if (!e.key) return
    if (!e.key.startsWith(`${STORAGE_PREFIX}:`)) return
    const storeSlug = e.key.slice(`${STORAGE_PREFIX}:`.length)
    carts.delete(storeSlug)
    emit(storeSlug)
  })
}

function readCartFromStorage(storeSlug: string): StorefrontCartState {
  if (typeof window === "undefined") return getServerEmptyCart(storeSlug)
  const raw = window.localStorage.getItem(storageKey(storeSlug))
  if (!raw) return getClientEmptyCart(storeSlug)
  try {
    const parsed = JSON.parse(raw) as Partial<StorefrontCartState> | null
    const itemsRaw = Array.isArray(parsed?.items) ? parsed!.items : []
    const items: StorefrontCartItem[] = itemsRaw
      .map((it) => {
        const product_id = typeof (it as StorefrontCartItem).product_id === "string" ? (it as StorefrontCartItem).product_id : ""
        const qtyRaw = Number((it as StorefrontCartItem).qty)
        const qty = Number.isFinite(qtyRaw) ? Math.max(Math.trunc(qtyRaw), 1) : 1
        const baseCostRaw = Number((it as StorefrontCartItem).base_cost)
        const base_cost = Number.isFinite(baseCostRaw) ? baseCostRaw : 0
        const marginRaw = Number((it as StorefrontCartItem).reseller_margin)
        const reseller_margin = Number.isFinite(marginRaw) ? marginRaw : 0
        if (!product_id) return null
        return { product_id, qty, base_cost, reseller_margin }
      })
      .filter(Boolean) as StorefrontCartItem[]

    const reseller_id = typeof parsed?.reseller_id === "string" ? parsed.reseller_id : null
    const updatedRaw = Number(parsed?.updated_at)
    const updated_at = Number.isFinite(updatedRaw) ? updatedRaw : Date.now()
    return { store_slug: storeSlug, reseller_id, items, updated_at }
  } catch {
    return getClientEmptyCart(storeSlug)
  }
}

function getCart(storeSlug: string): StorefrontCartState {
  ensureStorageListener()
  const cached = carts.get(storeSlug)
  if (cached) return cached
  const loaded = readCartFromStorage(storeSlug)
  carts.set(storeSlug, loaded)
  return loaded
}

function writeCart(storeSlug: string, next: StorefrontCartState) {
  carts.set(storeSlug, next)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(storeSlug), JSON.stringify(next))
  }
  emit(storeSlug)
}

export function subscribeStorefrontCart(storeSlug: string, cb: () => void) {
  ensureStorageListener()
  const set = listeners.get(storeSlug) ?? new Set<() => void>()
  set.add(cb)
  listeners.set(storeSlug, set)
  return () => {
    const current = listeners.get(storeSlug)
    if (!current) return
    current.delete(cb)
    if (current.size === 0) listeners.delete(storeSlug)
  }
}

export function getStorefrontCartSnapshot(storeSlug: string) {
  return getCart(storeSlug)
}

export function useStorefrontCart(storeSlug: string) {
  const snapshot = useSyncExternalStore(
    (cb) => subscribeStorefrontCart(storeSlug, cb),
    () => getStorefrontCartSnapshot(storeSlug),
    () => getServerEmptyCart(storeSlug)
  )

  return snapshot
}

export function getStorefrontCartTotalQty(cart: StorefrontCartState) {
  return cart.items.reduce((acc, it) => acc + (Number.isFinite(it.qty) ? it.qty : 0), 0)
}

export function addStorefrontCartItems(args: {
  storeSlug: string
  resellerId: string
  items: StorefrontCartItem[]
}) {
  const { storeSlug, resellerId, items } = args
  const current = getCart(storeSlug)

  const byId = new Map<string, StorefrontCartItem>()
  for (const it of current.items) byId.set(it.product_id, it)

  for (const incoming of items) {
    const product_id = incoming.product_id
    if (!product_id) continue
    const qty = Math.max(Math.trunc(Number(incoming.qty ?? 1)), 1)
    const base_cost = Number(incoming.base_cost) || 0
    const reseller_margin = Number(incoming.reseller_margin) || 0

    const existing = byId.get(product_id)
    if (!existing) {
      byId.set(product_id, { product_id, qty, base_cost, reseller_margin })
      continue
    }
    byId.set(product_id, {
      product_id,
      qty: existing.qty + qty,
      base_cost,
      reseller_margin,
    })
  }

  const next: StorefrontCartState = {
    store_slug: storeSlug,
    reseller_id: resellerId,
    items: Array.from(byId.values()),
    updated_at: Date.now(),
  }
  writeCart(storeSlug, next)
  return next
}

export function setStorefrontCartItemQty(args: {
  storeSlug: string
  productId: string
  qty: number
}) {
  const { storeSlug, productId } = args
  const qty = Math.max(Math.trunc(Number(args.qty)), 0)
  const current = getCart(storeSlug)
  const nextItems = current.items
    .map((it) => (it.product_id === productId ? { ...it, qty } : it))
    .filter((it) => it.qty > 0)

  const next: StorefrontCartState = { ...current, items: nextItems, updated_at: Date.now() }
  writeCart(storeSlug, next)
  return next
}

export function removeStorefrontCartItem(args: {
  storeSlug: string
  productId: string
}) {
  return setStorefrontCartItemQty({ storeSlug: args.storeSlug, productId: args.productId, qty: 0 })
}

export function clearStorefrontCart(storeSlug: string) {
  writeCart(storeSlug, getClientEmptyCart(storeSlug))
}

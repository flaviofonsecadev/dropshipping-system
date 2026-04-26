import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, MoreHorizontal } from "lucide-react"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type OrderMetricRow = {
  reseller_id: string | null
  total_amount: number | string | null
}

type StoreRow = {
  reseller_id: string
  slug: string
  name: string
  is_published: boolean
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

type ResellerListItem = {
  reseller_id: string
  store: StoreRow | null
  profile: ProfileRow | null
  total_orders: number | null
  revenue_total: number | null
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function formatBRL(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getInitials(input: string) {
  const clean = (input ?? "").trim()
  if (!clean) return "RV"
  const parts = clean.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1]) ?? ""
  const value = `${first}${last}`.toUpperCase()
  return value || "RV"
}

export default async function SupplierResellersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("reseller_id,total_amount")

  const metricsByReseller = new Map<string, { total_orders: number; revenue_total: number }>()
  if (!ordersError) {
    for (const row of (orders ?? []) as OrderMetricRow[]) {
      if (!row.reseller_id) continue
      const current = metricsByReseller.get(row.reseller_id) ?? { total_orders: 0, revenue_total: 0 }
      current.total_orders += 1
      current.revenue_total += toNumber(row.total_amount)
      metricsByReseller.set(row.reseller_id, current)
    }
  }

  const adminSupabase = createAdminClient()

  const storesQuery = adminSupabase
    ? await adminSupabase.from("reseller_stores").select("reseller_id,slug,name,is_published").order("created_at", { ascending: false })
    : await supabase.from("reseller_stores").select("reseller_id,slug,name,is_published").order("created_at", { ascending: false })

  const stores = ((storesQuery.data ?? []) as StoreRow[]).filter((s) => Boolean(s?.reseller_id))
  const storesError = storesQuery.error

  const resellerIdsFromStores = stores.map((s) => s.reseller_id)
  const resellerIdsFromOrders = Array.from(metricsByReseller.keys())
  const resellerIds = Array.from(new Set([...resellerIdsFromStores, ...resellerIdsFromOrders]))

  const profileLookup = new Map<string, ProfileRow>()

  if (adminSupabase && resellerIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from("profiles")
      .select("id,full_name,email,phone")
      .in("id", resellerIds)

    for (const profile of (profiles ?? []) as ProfileRow[]) {
      if (profile?.id) profileLookup.set(profile.id, profile)
    }
  }

  const items: ResellerListItem[] =
    stores.length > 0
      ? stores.map((store) => {
          const metrics = metricsByReseller.get(store.reseller_id) ?? null
          const profile = profileLookup.get(store.reseller_id) ?? null
          return {
            reseller_id: store.reseller_id,
            store,
            profile,
            total_orders: ordersError ? null : metrics?.total_orders ?? 0,
            revenue_total: ordersError ? null : metrics?.revenue_total ?? 0,
          }
        })
      : resellerIds.map((reseller_id) => {
          const metrics = metricsByReseller.get(reseller_id) ?? null
          const profile = profileLookup.get(reseller_id) ?? null
          return {
            reseller_id,
            store: null,
            profile,
            total_orders: ordersError ? null : metrics?.total_orders ?? 0,
            revenue_total: ordersError ? null : metrics?.revenue_total ?? 0,
          }
        })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revendedores</h2>
          <p className="text-muted-foreground mt-1">Gerencie sua rede de revendedores e acompanhe o desempenho em vendas.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Revendedor
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Revendedor</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Receita Gerada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storesError && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Não foi possível carregar os revendedores no momento.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Nenhum revendedor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const storeName = item.store?.name ?? "Loja"
                const storeSlug = item.store?.slug ?? null
                const contactName = item.profile?.full_name ?? "-"
                const contactEmail = item.profile?.email ?? "-"
                const initials = getInitials(item.profile?.full_name ?? item.store?.name ?? "")
                const statusLabel = item.store ? (item.store.is_published ? "Ativo" : "Inativo") : "Indisponível"

                return (
                  <TableRow key={item.reseller_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${encodeURIComponent(item.reseller_id)}.png`}
                            alt={storeName}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{storeName}</div>
                          <div className="text-xs text-muted-foreground">
                            {storeSlug ? `/${storeSlug}` : `ID: ${item.reseller_id}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{contactName}</div>
                      <div className="text-xs text-muted-foreground">{contactEmail}</div>
                    </TableCell>
                    <TableCell>{item.total_orders ?? "-"}</TableCell>
                    <TableCell>{formatBRL(item.revenue_total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusLabel === "Ativo" ? "default" : "secondary"}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" title="Ações">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

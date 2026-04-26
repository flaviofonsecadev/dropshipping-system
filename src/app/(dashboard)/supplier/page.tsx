import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type LastOrderRow = {
  id: string
  reseller_id: string | null
  created_at: string
  total_amount: number | null
  base_cost_total: number | null
  shipping_cost: number | null
}

type RevenueTimelineRow = {
  created_at: string
  base_cost_total: number | null
  shipping_cost: number | null
}

type ProfileLookupRow = {
  id: string
  full_name: string | null
  email: string | null
}

function formatBRL(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatMonthShort(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(value)
}

function formatCompactNumber(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function formatShortDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d)
}

function getResellerLabel(resellerId: string, profile: ProfileLookupRow | null) {
  if (!profile) return resellerId
  if (profile.full_name) return profile.full_name
  return profile.email ?? resellerId
}

export default async function SupplierDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const startOf6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    totalOrdersResult,
    monthOrdersResult,
    revenueOrdersResult,
    activeResellersResult,
    productsCountResult,
    lastOrdersResult,
    revenueTimelineResult,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    supabase.from("orders").select("base_cost_total,shipping_cost"),
    supabase
      .from("orders")
      .select("reseller_id,created_at")
      .not("reseller_id", "is", null)
      .gte("created_at", last30Days.toISOString())
      .limit(10000),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("supplier_id", user.id),
    supabase
      .from("orders")
      .select("id,reseller_id,created_at,total_amount,base_cost_total,shipping_cost")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("orders")
      .select("created_at,base_cost_total,shipping_cost")
      .gte("created_at", startOf6Months.toISOString()),
  ])

  const totalOrdersCount = totalOrdersResult.error ? null : totalOrdersResult.count ?? 0
  const monthOrdersCount = monthOrdersResult.error ? null : monthOrdersResult.count ?? 0
  const productsCount = productsCountResult.error ? null : productsCountResult.count ?? 0

  const revenueRows = (revenueOrdersResult.data ?? []) as Array<{
    base_cost_total: number | null
    shipping_cost: number | null
  }>

  const supplierRevenueTotal = revenueOrdersResult.error
    ? null
    : revenueRows.reduce((acc, row) => acc + (Number(row.base_cost_total ?? 0) + Number(row.shipping_cost ?? 0)), 0)

  const timelineRows: RevenueTimelineRow[] = (revenueTimelineResult.data ?? []) as RevenueTimelineRow[]
  const timelineByMonth = new Map<string, { total: number; orders: number }>()

  if (!revenueTimelineResult.error) {
    for (const row of timelineRows) {
      const createdAt = new Date(row.created_at)
      if (Number.isNaN(createdAt.getTime())) continue
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`
      const current = timelineByMonth.get(monthKey) ?? { total: 0, orders: 0 }
      current.total += Number(row.base_cost_total ?? 0) + Number(row.shipping_cost ?? 0)
      current.orders += 1
      timelineByMonth.set(monthKey, current)
    }
  }

  const monthlyOverview = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const values = timelineByMonth.get(key) ?? { total: 0, orders: 0 }
    return {
      key,
      label: formatMonthShort(d),
      total: values.total,
      orders: values.orders,
    }
  })

  const monthlyMax = monthlyOverview.reduce((acc, item) => Math.max(acc, item.total), 0)

  const activeResellerRows = (activeResellersResult.data ?? []) as Array<{ reseller_id: string | null }>
  const activeResellersCount = activeResellersResult.error
    ? null
    : new Set(
        activeResellerRows
          .map((row) => row.reseller_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ).size

  const lastOrders: LastOrderRow[] = (lastOrdersResult.data ?? []) as LastOrderRow[]

  const resellerLookup = new Map<string, ProfileLookupRow>()
  if (!lastOrdersResult.error) {
    const resellerIds = Array.from(
      new Set(
        lastOrders.map((row) => row.reseller_id).filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    )

    if (resellerIds.length > 0) {
      const adminSupabase = createAdminClient()
      if (adminSupabase) {
        const { data: profiles } = await adminSupabase
          .from("profiles")
          .select("id,full_name,email")
          .in("id", resellerIds)

        for (const profile of (profiles ?? []) as ProfileLookupRow[]) {
          resellerLookup.set(profile.id, profile)
        }
      }
    }
  }

  const metrics = [
    {
      title: "Receita Total",
      value: revenueOrdersResult.error ? "-" : formatBRL(supplierRevenueTotal),
      description: revenueOrdersResult.error ? "Não foi possível carregar no momento." : "Total recebido pela rede.",
      icon: DollarSign,
    },
    {
      title: "Pedidos",
      value: totalOrdersResult.error ? "-" : formatCompactNumber(totalOrdersCount),
      description: totalOrdersResult.error
        ? "Não foi possível carregar no momento."
        : monthOrdersCount === null
          ? "Total de pedidos registrados."
          : `Este mês: ${monthOrdersCount}.`,
      icon: ShoppingCart,
    },
    {
      title: "Revendedores Ativos",
      value: activeResellersResult.error ? "-" : formatCompactNumber(activeResellersCount),
      description: activeResellersResult.error ? "Não foi possível carregar no momento." : "Com pedidos nos últimos 30 dias.",
      icon: Users,
    },
    {
      title: "Produtos Ativos",
      value: productsCountResult.error ? "-" : formatCompactNumber(productsCount),
      description: productsCountResult.error ? "Não foi possível carregar no momento." : "Itens cadastrados no catálogo.",
      icon: Package,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Principal</h2>
          <p className="text-muted-foreground mt-1">Acompanhe as métricas de vendas e da sua rede de revendedores.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Resumo de receita (custo base + frete) nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {revenueTimelineResult.error ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Não foi possível carregar o resumo no momento.
              </div>
            ) : timelineRows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Sem dados suficientes para exibir.</div>
            ) : (
              <div className="space-y-4 p-4">
                {monthlyOverview.map((item) => {
                  const percent = monthlyMax > 0 ? (item.total / monthlyMax) * 100 : 0
                  return (
                    <div key={item.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-muted-foreground tabular-nums">
                          {formatBRL(item.total)} • {item.orders} pedido{item.orders === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>
              {monthOrdersResult.error
                ? "Não foi possível carregar os pedidos deste mês."
                : monthOrdersCount === 0
                  ? "Nenhum pedido registrado neste mês."
                  : `Você teve ${monthOrdersCount} pedido${monthOrdersCount === 1 ? "" : "s"} este mês.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastOrdersResult.error ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Não foi possível carregar os últimos pedidos no momento.
              </div>
            ) : lastOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum pedido para exibir.
              </div>
            ) : (
              <div className="space-y-8">
                {lastOrders.map((order) => {
                  const resellerId = order.reseller_id ?? "-"
                  const resellerProfile = order.reseller_id ? resellerLookup.get(order.reseller_id) ?? null : null
                  const supplierAmount = Number(order.base_cost_total ?? 0) + Number(order.shipping_cost ?? 0)

                  return (
                    <div key={order.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.reseller_id ? getResellerLabel(resellerId, resellerProfile) : "Pedido direto"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.reseller_id && resellerProfile?.email
                            ? resellerProfile.email
                            : `Pedido ${order.id} • ${formatShortDate(order.created_at)}`}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">+{formatBRL(supplierAmount)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

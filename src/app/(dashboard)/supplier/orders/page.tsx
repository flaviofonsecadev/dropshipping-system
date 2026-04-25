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
import { Download, MoreHorizontal } from "lucide-react"
import { createAdminClient, createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type SupplierOrderRow = {
  id: string
  reseller_id: string | null
  customer_name: string | null
  created_at: string
  payment_method: string | null
  total_amount: number | null
  status: string | null
}

type ProfileLookupRow = {
  id: string
  full_name: string | null
  email: string | null
}

function formatOrderDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d)
}

function formatBRL(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getStatusBadgeVariant(status: string | null) {
  const normalized = (status ?? "").toLowerCase()
  if (!normalized) return "outline" as const
  if (normalized.includes("cancel")) return "destructive" as const
  if (normalized.includes("entreg")) return "default" as const
  if (normalized.includes("envi")) return "secondary" as const
  if (normalized.includes("pago") || normalized.includes("aprov")) return "default" as const
  return "outline" as const
}

function getStatusBadgeClassName(status: string | null) {
  const normalized = (status ?? "").toLowerCase()
  if (normalized.includes("entreg") || normalized.includes("pago") || normalized.includes("aprov")) {
    return "bg-green-500 hover:bg-green-600 text-white"
  }
  return ""
}

function getResellerLabel(resellerId: string, profile: ProfileLookupRow | null) {
  if (!profile) return resellerId
  if (profile.full_name && profile.email) return `${profile.full_name} (${profile.email})`
  return profile.full_name ?? profile.email ?? resellerId
}

export default async function SupplierOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,reseller_id,customer_name,created_at,payment_method,total_amount,status")
    .order("created_at", { ascending: false })

  const rows: SupplierOrderRow[] = (orders ?? []) as SupplierOrderRow[]

  const resellerIds = Array.from(
    new Set(rows.map((row) => row.reseller_id).filter((id): id is string => typeof id === "string" && id.length > 0))
  )

  const resellerLookup = new Map<string, ProfileLookupRow>()

  if (!error && resellerIds.length > 0) {
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos da Rede</h2>
          <p className="text-muted-foreground mt-1">Visualize e gerencie os pedidos processados pelos seus revendedores.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Pedidos
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente Final</TableHead>
              <TableHead>Revendedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  Não foi possível carregar os pedidos no momento.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  Não há pedidos para exibir.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => {
                const resellerId = order.reseller_id ?? "-"
                const resellerProfile = order.reseller_id ? resellerLookup.get(order.reseller_id) ?? null : null

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer_name ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.reseller_id ? getResellerLabel(resellerId, resellerProfile) : "-"}
                    </TableCell>
                    <TableCell>{formatOrderDate(order.created_at)}</TableCell>
                    <TableCell>{order.payment_method ?? "-"}</TableCell>
                    <TableCell>{formatBRL(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className={getStatusBadgeClassName(order.status)}
                      >
                        {order.status ?? "-"}
                      </Badge>
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

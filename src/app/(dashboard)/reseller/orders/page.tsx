import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Filter, Download } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type ResellerOrderRow = {
  id: string
  customer_name: string | null
  created_at: string
  payment_method: string | null
  total_amount: number | null
  status: string | null
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

export default async function ResellerOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,customer_name,created_at,payment_method,total_amount,status")
    .eq("reseller_id", user.id)
    .order("created_at", { ascending: false })

  const rows: ResellerOrderRow[] = (orders ?? []) as ResellerOrderRow[]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Pedidos</h2>
          <p className="text-muted-foreground mt-1">Acompanhe as vendas da sua loja e o status de entrega para seus clientes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID ou cliente..."
            className="pl-8 bg-background"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md mt-4 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Não foi possível carregar seus pedidos no momento.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Você ainda não possui pedidos.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer_name ?? "-"}</TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Ver detalhes">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Palette, Store } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type ResellerLastOrderRow = {
  id: string
  customer_name: string | null
  created_at: string
  total_amount: number | string | null
  status: string | null
}

function formatOrderDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d)
}

function formatBRL(value: number | string | null) {
  const numberValue = typeof value === "string" ? Number(value) : value
  if (typeof numberValue !== "number" || !Number.isFinite(numberValue)) return "-"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numberValue)
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

export default async function ResellerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,customer_name,created_at,total_amount,status")
    .eq("reseller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const lastOrders: ResellerLastOrderRow[] = (orders ?? []) as ResellerLastOrderRow[]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Principal</h2>
          <p className="text-muted-foreground mt-1">Acompanhe sua operação e acesse os principais módulos da sua loja.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/reseller/store">
              <Store className="mr-2 h-4 w-4" />
              Ir para Loja
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reseller/settings/visual">
              <Palette className="mr-2 h-4 w-4" />
              Ajustar Visual
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loja</CardTitle>
            <CardDescription>Configure dados, domínio, pagamentos e logística da sua operação.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/reseller/store">Abrir Configurações da Loja</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visual</CardTitle>
            <CardDescription>Personalize home, banners e SEO para fortalecer sua marca.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/reseller/settings/visual">Abrir Editor Visual</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>Veja rapidamente os pedidos mais recentes da sua loja.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/reseller/orders">Ver todos pedidos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Não foi possível carregar seus pedidos no momento.
            </div>
          ) : lastOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Você ainda não possui pedidos.</div>
          ) : (
            <div className="border rounded-md bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium" title={order.id}>
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{order.customer_name ?? "-"}</TableCell>
                      <TableCell>{formatOrderDate(order.created_at)}</TableCell>
                      <TableCell>{formatBRL(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(order.status)}
                          className={getStatusBadgeClassName(order.status)}
                        >
                          {order.status ?? "-"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

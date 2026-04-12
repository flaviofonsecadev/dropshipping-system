import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react"

const metrics = [
  {
    title: "Receita Total",
    value: "R$ 45.231,89",
    description: "+20.1% em relação ao mês anterior",
    icon: DollarSign,
  },
  {
    title: "Pedidos",
    value: "+2350",
    description: "+180.1% em relação ao mês anterior",
    icon: ShoppingCart,
  },
  {
    title: "Revendedores Ativos",
    value: "+12,234",
    description: "+19% em relação ao mês anterior",
    icon: Users,
  },
  {
    title: "Produtos Ativos",
    value: "573",
    description: "+201 adicionados este mês",
    icon: Package,
  },
]

export default function SupplierDashboardPage() {
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
            <CardDescription>Resumo de vendas nos últimos meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md m-4">
              [Gráfico de Vendas - Placeholder]
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>
              Você teve 265 pedidos este mês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: "João Silva", email: "joao@example.com", amount: "R$ 1.999,00" },
                { name: "Maria Santos", email: "maria@example.com", amount: "R$ 39,00" },
                { name: "Pedro Costa", email: "pedro@example.com", amount: "R$ 299,00" },
                { name: "Ana Oliveira", email: "ana@example.com", amount: "R$ 99,00" },
              ].map((order, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+{order.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

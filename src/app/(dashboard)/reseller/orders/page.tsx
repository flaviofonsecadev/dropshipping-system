import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Filter, Download } from "lucide-react"

const orders = [
  {
    id: "ORD-9381",
    customer: "João Silva",
    date: "12 Abr 2026",
    status: "Enviado",
    total: "R$ 299,90",
    payment: "PIX",
  },
  {
    id: "ORD-9380",
    customer: "Maria Santos",
    date: "11 Abr 2026",
    status: "Processando",
    total: "R$ 149,90",
    payment: "Cartão",
  },
  {
    id: "ORD-9379",
    customer: "Pedro Oliveira",
    date: "10 Abr 2026",
    status: "Entregue",
    total: "R$ 89,90",
    payment: "PIX",
  },
  {
    id: "ORD-9378",
    customer: "Ana Costa",
    date: "09 Abr 2026",
    status: "Cancelado",
    total: "R$ 450,00",
    payment: "Boleto",
  },
  {
    id: "ORD-9377",
    customer: "Lucas Mendes",
    date: "08 Abr 2026",
    status: "Entregue",
    total: "R$ 120,50",
    payment: "Cartão",
  },
]

export default function ResellerOrdersPage() {
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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "Entregue" ? "default" :
                      order.status === "Enviado" ? "secondary" :
                      order.status === "Cancelado" ? "destructive" : "outline"
                    }
                    className={order.status === "Entregue" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

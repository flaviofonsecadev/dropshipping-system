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

const orders = [
  {
    id: "ORD-7352",
    customer: "Maria Oliveira",
    reseller: "Parceiro A",
    date: "24/10/2023",
    total: "R$ 350,00",
    status: "Processando",
    payment: "Aprovado",
  },
  {
    id: "ORD-7351",
    customer: "Carlos Mendes",
    reseller: "Parceiro B",
    date: "23/10/2023",
    total: "R$ 1.200,00",
    status: "Enviado",
    payment: "Aprovado",
  },
  {
    id: "ORD-7350",
    customer: "Fernanda Costa",
    reseller: "Parceiro C",
    date: "22/10/2023",
    total: "R$ 89,90",
    status: "Pendente",
    payment: "Aguardando",
  },
  {
    id: "ORD-7349",
    customer: "Lucas Silva",
    reseller: "Parceiro A",
    date: "20/10/2023",
    total: "R$ 499,90",
    status: "Entregue",
    payment: "Aprovado",
  },
]

export default function SupplierOrdersPage() {
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
              <TableHead>Parceiro Reseller</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status de Envio</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="text-muted-foreground">{order.reseller}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge 
                    variant={order.payment === "Aprovado" ? "default" : "secondary"}
                  >
                    {order.payment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "Entregue" ? "default" : 
                      order.status === "Processando" ? "secondary" : 
                      order.status === "Enviado" ? "outline" : "destructive"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
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

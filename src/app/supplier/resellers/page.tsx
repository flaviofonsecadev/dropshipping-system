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

const resellers = [
  {
    id: "REV-001",
    name: "Loja do João",
    owner: "João Silva",
    email: "joao@loja.com",
    sales: 145,
    revenue: "R$ 12.450,00",
    status: "Ativo",
    avatar: "JS",
  },
  {
    id: "REV-002",
    name: "Boutique Maria",
    owner: "Maria Santos",
    email: "contato@boutiquemaria.com",
    sales: 89,
    revenue: "R$ 8.900,00",
    status: "Ativo",
    avatar: "MS",
  },
  {
    id: "REV-003",
    name: "Tech Store",
    owner: "Pedro Costa",
    email: "pedro@techstore.com.br",
    sales: 12,
    revenue: "R$ 1.200,00",
    status: "Inativo",
    avatar: "PC",
  },
  {
    id: "REV-004",
    name: "Ana Modas",
    owner: "Ana Oliveira",
    email: "ana@anamodas.com",
    sales: 234,
    revenue: "R$ 24.500,00",
    status: "Ativo",
    avatar: "AO",
  },
]

export default function SupplierResellersPage() {
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
            {resellers.map((reseller) => (
              <TableRow key={reseller.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${reseller.avatar}.png`} alt={reseller.name} />
                      <AvatarFallback>{reseller.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{reseller.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {reseller.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{reseller.owner}</div>
                  <div className="text-xs text-muted-foreground">{reseller.email}</div>
                </TableCell>
                <TableCell>{reseller.sales}</TableCell>
                <TableCell>{reseller.revenue}</TableCell>
                <TableCell>
                  <Badge 
                    variant={reseller.status === "Ativo" ? "default" : "secondary"}
                  >
                    {reseller.status}
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

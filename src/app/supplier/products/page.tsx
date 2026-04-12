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
import { Plus, MoreHorizontal } from "lucide-react"

const products = [
  {
    id: "PROD-001",
    name: "Camiseta Básica de Algodão",
    sku: "TSH-COT-BLK",
    price: "R$ 49,90",
    stock: 120,
    status: "Ativo",
  },
  {
    id: "PROD-002",
    name: "Calça Jeans Slim",
    sku: "JNS-SLM-BLU",
    price: "R$ 159,90",
    stock: 45,
    status: "Ativo",
  },
  {
    id: "PROD-003",
    name: "Tênis Esportivo Casual",
    sku: "SNE-SPO-WHT",
    price: "R$ 299,90",
    stock: 0,
    status: "Esgotado",
  },
  {
    id: "PROD-004",
    name: "Jaqueta Corta Vento",
    sku: "JKT-WND-GRY",
    price: "R$ 189,90",
    stock: 32,
    status: "Rascunho",
  },
]

export default function SupplierProductsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-muted-foreground mt-1">Gerencie os itens disponíveis para a sua rede de revendedores.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      product.status === "Ativo" ? "default" :
                      product.status === "Esgotado" ? "destructive" : "secondary"
                    }
                  >
                    {product.status}
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

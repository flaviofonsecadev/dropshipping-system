import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, MoreHorizontal, Image as ImageIcon, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function SupplierProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type SupplierProduct = {
    id: string
    name: string
    sku: string
    base_cost: number
    suggested_margin: number
    stock_quantity: number
    images: string[] | null
  }

  let products: SupplierProduct[] = []

  if (user) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) products = data
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-muted-foreground mt-1">Gerencie os itens disponíveis para a sua rede de revendedores.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/supplier/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Capa</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Custo Base</TableHead>
              <TableHead>Margem Sug.</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum produto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <div className="w-10 h-10 rounded overflow-hidden border">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>R$ {Number(product.base_cost).toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>R$ {Number(product.suggested_margin).toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link
                            href={`/supplier/products/${product.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`/supplier/products/${product.id}/edit`}
                            className="flex items-center w-full"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

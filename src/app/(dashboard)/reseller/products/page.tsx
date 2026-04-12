import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Eye } from "lucide-react"
import Link from "next/link"

export default async function ResellerCatalogPage() {
  const supabase = await createClient()

  // Pega os produtos ativos (no futuro, pode ser os que o reseller adicionou à loja dele)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo Disponível</h2>
          <p className="text-muted-foreground mt-1">Explore os produtos fornecidos para revenda.</p>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="border rounded-md p-12 text-center text-muted-foreground">
          Nenhum produto disponível no catálogo no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <div className="aspect-square bg-muted relative border-b">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="text-xs">SKU: {product.sku}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">Custo Base</span>
                  <span className="font-semibold">R$ {Number(product.base_cost).toFixed(2).replace('.', ',')}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t mt-auto">
                <Link href={`/reseller/products/${product.id}`} className="w-full mt-4">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" /> Detalhes
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
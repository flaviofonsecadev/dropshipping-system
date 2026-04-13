"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { upsertResellerProductAction } from "./actions"

type Product = {
  id: string
  name: string
  sku: string
  base_cost: number
  suggested_margin: number
  images: string[] | null
}

type ResellerProduct = {
  product_id: string
  custom_margin: number | null
  is_active: boolean
}

export function CatalogManager({
  products,
  resellerProducts,
  saved,
  error,
}: {
  products: Product[]
  resellerProducts: ResellerProduct[]
  saved: boolean
  error: string | null
}) {
  const resellerMap = useMemo(() => {
    const map = new Map<string, ResellerProduct>()
    resellerProducts.forEach((rp) => map.set(rp.product_id, rp))
    return map
  }, [resellerProducts])

  const message = useMemo(() => {
    if (saved) return { type: "success" as const, text: "Catálogo atualizado com sucesso." }
    if (!error) return null
    if (error === "save_failed") return { type: "error" as const, text: "Não foi possível salvar. Tente novamente." }
    if (error === "missing_product") return { type: "error" as const, text: "Produto inválido." }
    return { type: "error" as const, text: "Não foi possível salvar. Tente novamente." }
  }, [saved, error])

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Catálogo da Loja</h2>
        <p className="text-muted-foreground mt-1">
          Ative produtos e defina sua margem. O preço final é calculado automaticamente.
        </p>
      </div>

      {message && (
        <div
          className={
            message.type === "success"
              ? "rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          }
          role={message.type === "success" ? "status" : "alert"}
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>Controle o que aparece na sua vitrine pública.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Capa</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="w-[120px]">Ativo</TableHead>
                  <TableHead className="w-[160px]">Margem (%)</TableHead>
                  <TableHead className="w-[180px]">Preço Final</TableHead>
                  <TableHead className="w-[140px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum produto disponível.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <CatalogRow key={p.id} product={p} resellerProduct={resellerMap.get(p.id) ?? null} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CatalogRow({ product, resellerProduct }: { product: Product; resellerProduct: ResellerProduct | null }) {
  const baseCost = Number(product.base_cost) || 0
  const defaultMarginValue =
    resellerProduct?.custom_margin ?? (Number(product.suggested_margin) || 0)
  const defaultPercent = baseCost > 0 ? (defaultMarginValue / baseCost) * 100 : 0

  const [isActive, setIsActive] = useState(Boolean(resellerProduct?.is_active))
  const [marginPercent, setMarginPercent] = useState<string>(defaultPercent.toFixed(1))

  const parsedMarginPercent = parseFloat(marginPercent) || 0
  const marginValue = baseCost * (parsedMarginPercent / 100)
  const finalPrice = baseCost + marginValue

  return (
    <TableRow>
      <TableCell>
        {product.images && product.images.length > 0 ? (
          <div className="w-10 h-10 rounded overflow-hidden border">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-muted border" />
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">{isActive ? "Sim" : "Não"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.1"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            className="h-9"
          />
          <span className="text-sm font-medium">%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Lucro: <span className="font-medium">R$ {marginValue.toFixed(2).replace(".", ",")}</span>
        </p>
      </TableCell>
      <TableCell>
        <div className="font-semibold">R$ {finalPrice.toFixed(2).replace(".", ",")}</div>
        <p className="text-xs text-muted-foreground">Custo: R$ {baseCost.toFixed(2).replace(".", ",")}</p>
      </TableCell>
      <TableCell>
        <form action={upsertResellerProductAction} className="flex justify-end">
          <input type="hidden" name="product_id" value={product.id} />
          <input type="hidden" name="is_active" value={String(isActive)} />
          <input type="hidden" name="custom_margin" value={marginValue.toFixed(2)} />
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </form>
      </TableCell>
    </TableRow>
  )
}

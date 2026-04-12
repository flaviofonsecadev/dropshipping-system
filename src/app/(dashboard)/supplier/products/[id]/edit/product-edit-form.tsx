"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { ProductMediaForm } from "@/components/products/product-media-form"
import { updateProductAction, deleteProductAction } from "../../actions"
import type { Product } from "@/types/database"

interface ProductEditFormProps {
  product: Product
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Mídias
  const [images, setImages] = useState<string[]>(product.images || [])
  const [videos, setVideos] = useState<string[]>(product.videos || [])

  // Precificação
  const initialBaseCost = Number(product.base_cost) || 0
  const initialMargin = Number(product.suggested_margin) || 0
  const initialPercent = initialBaseCost > 0 ? (initialMargin / initialBaseCost) * 100 : 0
  
  const [baseCost, setBaseCost] = useState<string>(initialBaseCost.toString())
  const [marginPercent, setMarginPercent] = useState<string>(initialPercent.toFixed(1))

  // Cálculos automáticos
  const parsedBaseCost = parseFloat(baseCost) || 0
  const parsedMarginPercent = parseFloat(marginPercent) || 0
  const marginValue = parsedBaseCost * (parsedMarginPercent / 100)
  const finalPrice = parsedBaseCost + marginValue

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.append('images', JSON.stringify(images))
      formData.append('videos', JSON.stringify(videos))
      await updateProductAction(product.id, formData)
    } catch (error) {
      console.error(error)
      alert("Erro ao atualizar produto. Verifique o console.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      setIsDeleting(true)
      try {
        await deleteProductAction(product.id)
      } catch (error) {
        console.error(error)
        alert("Erro ao excluir produto.")
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Editar Produto</h2>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting || isDeleting}>
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? "Excluindo..." : "Excluir Produto"}
        </Button>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" name="name" required defaultValue={product.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={product.description || ""}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU (Código) *</Label>
                  <Input id="sku" name="sku" required defaultValue={product.sku} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock_quantity">Estoque Atual</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={product.stock_quantity} min={0} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mídias do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductMediaForm 
                images={images} 
                setImages={setImages} 
                videos={videos} 
                setVideos={setVideos} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Precificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="base_cost">Custo Base (R$) *</Label>
                <Input 
                  id="base_cost" 
                  name="base_cost" 
                  type="number" 
                  step="0.01" 
                  required 
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="margin_percent">Margem Sugerida (%) *</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    id="margin_percent" 
                    type="number" 
                    step="0.1" 
                    required 
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(e.target.value)}
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
                <input type="hidden" name="suggested_margin" value={marginValue.toFixed(2)} />
                <p className="text-xs text-muted-foreground">
                  Lucro em reais: <strong className="text-green-600">R$ {marginValue.toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Preço Final de Venda</Label>
                <div className="text-3xl font-bold text-primary mt-1">
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logística e Frete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="weight_kg">Peso (kg) *</Label>
                <Input id="weight_kg" name="weight_kg" type="number" step="0.001" required defaultValue={product.weight_kg} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="length_cm">Comp. (cm)</Label>
                  <Input id="length_cm" name="length_cm" type="number" step="0.01" required defaultValue={product.length_cm} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="width_cm">Larg. (cm)</Label>
                  <Input id="width_cm" name="width_cm" type="number" step="0.01" required defaultValue={product.width_cm} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height_cm">Alt. (cm)</Label>
                  <Input id="height_cm" name="height_cm" type="number" step="0.01" required defaultValue={product.height_cm} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting || isDeleting} className="w-full h-12 text-lg">
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

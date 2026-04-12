"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { ProductMediaForm } from "@/components/products/product-media-form"
import { createProductAction } from "../actions"

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])

  // Estados de precificação
  const [baseCost, setBaseCost] = useState<string>("")
  const [marginPercent, setMarginPercent] = useState<string>("")

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
      await createProductAction(formData)
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar produto. Verifique o console.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Novo Produto</h2>
          <p className="text-muted-foreground">Cadastre um novo item no seu catálogo.</p>
        </div>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* INFORMAÇÕES BÁSICAS */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Nome, descrição e detalhes do produto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" name="name" required placeholder="Ex: Camiseta Básica de Algodão" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Descreva os detalhes, material, etc." 
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU (Código) *</Label>
                  <Input id="sku" name="sku" required placeholder="Ex: TSH-COT-BLK" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock_quantity">Estoque Inicial</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={0} min={0} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÍDIAS (Fotos e Vídeos) */}
          <Card>
            <CardHeader>
              <CardTitle>Mídias do Produto</CardTitle>
              <CardDescription>Gerencie as fotos e o vídeo do seu produto.</CardDescription>
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
          {/* PRECIFICAÇÃO */}
          <Card>
            <CardHeader>
              <CardTitle>Precificação</CardTitle>
              <CardDescription>Custos e margens sugeridas.</CardDescription>
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
                  placeholder="0.00" 
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
                    placeholder="0" 
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(e.target.value)}
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
                {/* Input escondido para enviar o valor em Reais para o banco, já que a coluna suggested_margin é um NUMERIC */}
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

          {/* LOGÍSTICA */}
          <Card>
            <CardHeader>
              <CardTitle>Logística e Frete</CardTitle>
              <CardDescription>Medidas para cálculo de envio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="weight_kg">Peso (kg) *</Label>
                <Input id="weight_kg" name="weight_kg" type="number" step="0.001" required placeholder="0.000" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="length_cm">Comp. (cm) *</Label>
                  <Input id="length_cm" name="length_cm" type="number" step="0.01" required placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="width_cm">Larg. (cm) *</Label>
                  <Input id="width_cm" name="width_cm" type="number" step="0.01" required placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height_cm">Alt. (cm) *</Label>
                  <Input id="height_cm" name="height_cm" type="number" step="0.01" required placeholder="0" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AÇÕES */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

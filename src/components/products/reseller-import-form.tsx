"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface ResellerImportFormProps {
  productId: string
  baseCost: number
  suggestedMargin: number
}

export function ResellerImportForm({ productId, baseCost, suggestedMargin }: ResellerImportFormProps) {
  // Inicializa o estado com a sugestão do fornecedor (convertendo valor de margem em reais para porcentagem, ou usando 0 se não der)
  const initialPercent = baseCost > 0 ? (suggestedMargin / baseCost) * 100 : 0
  const [marginPercent, setMarginPercent] = useState<string>(initialPercent.toFixed(1))
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cálculos automáticos
  const parsedMarginPercent = parseFloat(marginPercent) || 0
  const marginValue = baseCost * (parsedMarginPercent / 100)
  const finalPrice = baseCost + marginValue

  async function handleImport(formData: FormData) {
    setIsSubmitting(true)
    try {
      // TODO: Aqui vamos chamar a Server Action de importar para o catálogo do revendedor (reseller_products)
      // formData já tem productId e custom_margin (em R$) por causa do input hidden
      await new Promise(r => setTimeout(r, 1000)) // Simulação por enquanto
      alert("Produto adicionado à sua loja com sucesso!")
    } catch (error) {
      console.error(error)
      alert("Erro ao adicionar produto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Adicionar à Minha Loja</CardTitle>
        <CardDescription>Defina sua margem de lucro e adicione este produto ao seu catálogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleImport} className="space-y-6">
          <input type="hidden" name="product_id" value={productId} />
          
          <div className="grid gap-2">
            <Label htmlFor="margin_percent">Sua Margem de Lucro (%)</Label>
            <div className="flex gap-2 items-center">
              <Input 
                id="margin_percent" 
                type="number" 
                step="0.1" 
                required 
                value={marginPercent}
                onChange={(e) => setMarginPercent(e.target.value)}
                className="bg-background"
              />
              <span className="text-sm font-medium">%</span>
            </div>
            <input type="hidden" name="custom_margin" value={marginValue.toFixed(2)} />
            <p className="text-xs text-muted-foreground">
              Seu lucro será de: <strong className="text-green-600">R$ {marginValue.toFixed(2).replace('.', ',')}</strong> por venda.
            </p>
          </div>

          <div className="pt-4 border-t border-primary/10">
            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Preço Final para o seu Cliente</Label>
            <div className="text-3xl font-bold text-primary mt-1">
              R$ {finalPrice.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg mt-4">
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? "Adicionando..." : "Adicionar ao Catálogo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
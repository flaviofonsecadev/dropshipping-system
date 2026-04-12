import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Store } from "lucide-react"

export default function ResellerPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reseller | Painel</h2>
          <p className="text-muted-foreground">Acompanhe sua operação e acesse os principais módulos da sua loja.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/reseller/store">
              <Store className="mr-2 h-4 w-4" />
              Ir para Loja
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reseller/settings/visual">
              <Palette className="mr-2 h-4 w-4" />
              Ajustar Visual
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loja</CardTitle>
            <CardDescription>Configure dados, domínio, pagamentos e logística da sua operação.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/reseller/store">Abrir Configurações da Loja</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visual</CardTitle>
            <CardDescription>Personalize home, banners e SEO para fortalecer sua marca.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild>
              <Link href="/reseller/settings/visual">Abrir Editor Visual</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

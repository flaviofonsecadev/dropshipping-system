import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layout, ImageIcon, LayoutGrid, Search, Plus, Trash, Megaphone, Save } from "lucide-react"

export default function VisualSettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Visual do Site</h2>
          <p className="text-muted-foreground mt-1">Gerencie a aparência, blocos da página e configurações de SEO.</p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="blocos" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start mb-6 bg-transparent">
          <TabsTrigger value="blocos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Layout className="w-4 h-4 mr-2" />
            Blocos da Página
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Search className="w-4 h-4 mr-2" />
            Configurações de SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocos" className="mt-0 space-y-6">
          {/* Hero Slider */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Hero Slider
                  </CardTitle>
                  <CardDescription>
                    Gerencie os banners principais exibidos no topo da sua loja.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-12 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Banner Coleção de Verão</h4>
                      <p className="text-xs text-muted-foreground">Link: /colecao-verao</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Layout className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Grid de Produtos
              </CardTitle>
              <CardDescription>
                Selecione as categorias ou coleções que terão destaque na página inicial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Título da Seção 1</Label>
                  <Input defaultValue="Lançamentos" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria Vinculada</Label>
                  <Input defaultValue="Novidades" />
                </div>
                <div className="space-y-2">
                  <Label>Título da Seção 2</Label>
                  <Input defaultValue="Mais Vendidos" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria Vinculada</Label>
                  <Input defaultValue="Destaques" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-4">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Seção
              </Button>
            </CardFooter>
          </Card>

          {/* Banners Promocionais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Banners Promocionais
                  </CardTitle>
                  <CardDescription>
                    Banners secundários exibidos entre os grids de produtos.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum banner promocional configurado.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
              <CardDescription>
                Otimize sua loja para os motores de busca (Google, Bing, etc) e melhore seu ranqueamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-3xl">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Título da Página Inicial (Meta Title)</Label>
                  <Input id="seo-title" placeholder="Ex: Minha Loja - As melhores roupas da estação" />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 50 e 60 caracteres.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seo-description">Descrição da Loja (Meta Description)</Label>
                  <textarea 
                    id="seo-description" 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Escreva um breve resumo sobre o que sua loja oferece. Isso aparecerá nos resultados de busca."
                  />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 150 e 160 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Palavras-chave (Keywords)</Label>
                  <Input id="seo-keywords" placeholder="roupas, moda, verão, camisetas (separadas por vírgula)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga-id">ID do Google Analytics</Label>
                  <Input id="ga-id" placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4">
              <Button className="ml-auto">Salvar Configurações de SEO</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

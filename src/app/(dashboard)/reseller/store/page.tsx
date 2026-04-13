import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Store, CreditCard, Paintbrush, Truck, Globe, Settings, DollarSign } from "lucide-react"
import { redirect } from "next/navigation"

export default function ResellerStorePage() {
  redirect("/reseller/store/settings")
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações da Loja</h2>
          <p className="text-muted-foreground mt-1">Gerencie dados, aparência e integrações da sua operação.</p>
        </div>
        <Button>
          <Globe className="mr-2 h-4 w-4" />
          Visualizar Loja
        </Button>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start mb-6 bg-transparent">
          <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Store className="w-4 h-4 mr-2" />
            Status da Loja
          </TabsTrigger>
          <TabsTrigger value="dados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Settings className="w-4 h-4 mr-2" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="endereco" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Store className="w-4 h-4 mr-2" />
            Endereço
          </TabsTrigger>
          <TabsTrigger value="dominio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Globe className="w-4 h-4 mr-2" />
            Domínio
          </TabsTrigger>
          <TabsTrigger value="precificacao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <DollarSign className="w-4 h-4 mr-2" />
            Precificação Global
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <CreditCard className="w-4 h-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="envios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-md">
            <Truck className="w-4 h-4 mr-2" />
            Envios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-0">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                Progresso de Configuração
              </CardTitle>
              <CardDescription>
                Complete os passos abaixo para ativar sua loja e começar a vender com sucesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Progresso geral da loja</span>
                  <span className="font-bold text-primary">25% concluído</span>
                </div>
                <Progress value={25} className="h-2.5 w-full bg-secondary" />
                <p className="text-xs text-muted-foreground">Faltam 3 etapas para finalizar a configuração inicial.</p>
              </div>

              <div className="grid gap-4 max-w-4xl">
                {/* Asaas (Concluído) */}
                <div className="flex items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 sm:mt-0 bg-primary/10 p-2 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        Conta Asaas
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Concluído</span>
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-xl">Sua conta de recebimentos já foi criada e integrada com sucesso à plataforma.</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground" disabled>Configurado</Button>
                </div>

                {/* Tema */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl border-l-4 border-l-orange-500 bg-card shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 sm:mt-0 bg-orange-500/10 p-2 rounded-full">
                      <Paintbrush className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">Tema e Personalização</h4>
                      <p className="text-sm text-muted-foreground max-w-xl">Escolha as cores, o logotipo e o visual que mais combina com a sua marca.</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">Configurar agora</Button>
                </div>

                {/* Pagamentos */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl border bg-card hover:bg-muted/20 transition-colors gap-4 sm:gap-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 sm:mt-0 bg-secondary p-2 rounded-full">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-muted-foreground">Formas de Pagamento</h4>
                      <p className="text-sm text-muted-foreground max-w-xl">Configure as opções de PIX, Cartão de Crédito ou Boleto para os clientes.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Configurar</Button>
                </div>

                {/* Envios */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl border bg-card hover:bg-muted/20 transition-colors gap-4 sm:gap-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 sm:mt-0 bg-secondary p-2 rounded-full">
                      <Truck className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-muted-foreground">Métodos de Envio</h4>
                      <p className="text-sm text-muted-foreground max-w-xl">Defina os serviços de entrega como Correios e Transportadoras particulares.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Configurar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Loja</CardTitle>
              <CardDescription>
                Informações básicas sobre o seu negócio e dados de contato público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="store-name" className="text-sm font-medium">Nome da Loja</Label>
                  <Input id="store-name" placeholder="Ex: Minha Loja Incrível" className="h-11" />
                  <p className="text-[11px] text-muted-foreground">O nome que aparecerá no cabeçalho da loja.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document" className="text-sm font-medium">CNPJ / CPF</Label>
                  <Input id="document" placeholder="00.000.000/0001-00" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail de Contato</Label>
                  <Input id="email" type="email" placeholder="contato@minhaloja.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone / WhatsApp</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" className="h-11" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4">
              <Button className="ml-auto">Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="endereco" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Origem</CardTitle>
              <CardDescription>
                Utilizado para o cálculo de frete, etiquetas de envio e emissão de notas fiscais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
                <div className="space-y-2">
                  <Label htmlFor="zipcode" className="text-sm font-medium">CEP</Label>
                  <Input id="zipcode" placeholder="00000-000" className="h-11" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="street" className="text-sm font-medium">Logradouro</Label>
                  <Input id="street" placeholder="Rua, Avenida, etc" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-sm font-medium">Número</Label>
                  <Input id="number" placeholder="123" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement" className="text-sm font-medium">Complemento <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                  <Input id="complement" placeholder="Apto 45, Bloco B" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-sm font-medium">Bairro</Label>
                  <Input id="neighborhood" placeholder="Centro" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                  <Input id="city" placeholder="São Paulo" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">Estado (UF)</Label>
                  <Input id="state" placeholder="SP" className="h-11" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4">
              <Button className="ml-auto">Salvar Endereço</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dominio" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Domínio Personalizado</CardTitle>
              <CardDescription>
                Conecte seu domínio próprio para dar mais profissionalismo à sua loja (ex: www.sualoja.com.br).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-1">Domínio Atual</p>
                  <div className="flex items-center gap-2 text-primary font-mono text-sm">
                    <Globe className="w-4 h-4" />
                    <span>sualoja.dropshippingmilionario.com.br</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-domain" className="text-sm font-medium">Novo Domínio</Label>
                  <div className="flex gap-2">
                    <Input id="custom-domain" placeholder="www.sualoja.com.br" className="h-11 flex-1" />
                    <Button className="h-11 px-8">Conectar</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Você precisará configurar os apontamentos DNS (CNAME e A) no seu provedor de registro.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precificacao" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Precificação Global</CardTitle>
              <CardDescription>
                Defina as regras globais de precificação e margem de lucro para os produtos do catálogo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="global-margin" className="text-sm font-medium">Margem de Lucro Padrão (%)</Label>
                  <Input id="global-margin" type="number" placeholder="Ex: 30" className="h-11" />
                  <p className="text-xs text-muted-foreground mt-1">Essa margem será aplicada automaticamente a novos produtos importados do fornecedor caso você não defina uma margem específica para o produto.</p>
                </div>
                
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-blue-700 dark:text-blue-400">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Como funciona o Split de Pagamentos?
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Quando uma venda é realizada, o sistema ASAAS divide automaticamente o valor. O <strong>Custo Base + Frete</strong> vai direto para a conta do Fornecedor, e a <strong>Sua Margem de Lucro</strong> vai direto para a sua subconta. Você não precisa se preocupar com repasses manuais.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4">
              <Button className="ml-auto">Salvar Regras</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>
                Gerencie como seus clientes pagarão pelas compras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Módulo de pagamentos em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="envios" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Envio</CardTitle>
              <CardDescription>
                Configure as opções e regras de frete da sua loja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Módulo de envios em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

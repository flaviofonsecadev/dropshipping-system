import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { connectSupplierAsaasAction, disconnectSupplierAsaasAction } from "./actions"

export default async function SupplierPaymentsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const sp = await searchParams
  const saved = sp.saved === "1"
  const error = typeof sp.error === "string" ? sp.error : null

  const { data: profile } = await supabase
    .from("profiles")
    .select("asaas_wallet_id,asaas_api_key_hint,asaas_connected_at")
    .eq("id", user.id)
    .single()

  const isConnected = Boolean(profile?.asaas_wallet_id && profile?.asaas_api_key_hint)

  const asaasEnv = (process.env.ASAAS_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox"

  const message =
    saved ? "Configuração salva." :
    error === "missing_api_key" ? "Informe a API key do Asaas." :
    error === "wallet_unavailable" ? "Não foi possível obter o walletId automaticamente. Informe o walletId manualmente e tente novamente." :
    error === "asaas_401" || error === "asaas_403"
      ? `Acesso negado pelo Asaas. Verifique se a chave é do ambiente ${asaasEnv} e se tem permissão.`
      : error === "asaas_404"
        ? "Endpoint do Asaas não encontrado (verifique o ambiente/configuração)."
        : error === "asaas_500"
          ? "O Asaas retornou erro interno ao validar/buscar dados. Tente novamente em alguns minutos."
        : error?.startsWith("asaas_")
          ? "Erro retornado pelo Asaas ao validar a chave."
          :
    error === "invalid_api_key" ? "API key inválida ou sem permissão para consultar walletId." :
    error === "save_failed" ? "Não foi possível salvar. Tente novamente." :
    null

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Pagamentos (Asaas)</h2>
        <p className="text-muted-foreground mt-1">Configure a conta principal do fornecedor para receber o split de custo+envio.</p>
        <p className="text-xs text-muted-foreground mt-2">Ambiente Asaas: {asaasEnv}</p>
      </div>

      {message && (
        <div
          className={
            saved
              ? "rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          }
          role={saved ? "status" : "alert"}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Conta principal</CardTitle>
          <CardDescription>Salvar a API key do Asaas e validar o walletId.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="text-sm text-muted-foreground">
              {isConnected ? `Conectado (${profile?.asaas_api_key_hint})` : "Não conectado"}
            </div>
            {profile?.asaas_wallet_id && <div className="text-xs text-muted-foreground">walletId: {profile.asaas_wallet_id}</div>}
          </div>

          <div className="space-y-4">
            <form action={connectSupplierAsaasAction} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="asaas_api_key">API Key</Label>
                <Input id="asaas_api_key" name="asaas_api_key" type="password" placeholder="$aact_..." autoComplete="off" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asaas_wallet_id">walletId (opcional)</Label>
                <Input id="asaas_wallet_id" name="asaas_wallet_id" placeholder="UUID do walletId" autoComplete="off" />
                <div className="text-xs text-muted-foreground">Use apenas se a obtenção automática do walletId falhar.</div>
              </div>
              <Button type="submit">Conectar</Button>
            </form>

            {isConnected && (
              <form action={disconnectSupplierAsaasAction}>
                <Button type="submit" variant="outline">Desconectar</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

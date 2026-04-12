import { createClient, createAdminClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let role = null
  
  const adminSupabase = createAdminClient()
  
  if (adminSupabase) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || user.user_metadata?.role || 'reseller'
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || user.user_metadata?.role || 'reseller'
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Meu Perfil</h2>
          <p className="text-muted-foreground mt-1">Gerencie as informações da sua conta.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            Dados da Conta
          </CardTitle>
          <CardDescription>
            Informações básicas vinculadas ao seu acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
          </div>
          
          <div className="grid gap-2 max-w-sm mt-4">
            <Label htmlFor="role">Nível de Acesso (Role)</Label>
            <Input id="role" type="text" value={role.toUpperCase()} disabled className="uppercase font-medium" />
          </div>
          
          <div className="grid gap-2 max-w-sm mt-4">
            <Label htmlFor="id">ID da Conta</Label>
            <Input id="id" type="text" value={user.id} disabled className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

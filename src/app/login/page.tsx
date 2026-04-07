'use client'

import { useActionState } from 'react'
import { loginAction, signupAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, null)
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, null)

  const isPending = isLoginPending || isSignupPending

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Acesso</CardTitle>
          <CardDescription>
            Entre na sua conta ou crie uma nova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@exemplo.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
              />
            </div>

            {/* Mensagens de Erro ou Sucesso */}
            {loginState?.error && (
              <p className="text-sm text-red-500 font-medium">{loginState.error}</p>
            )}
            {signupState?.error && (
              <p className="text-sm text-red-500 font-medium">{signupState.error}</p>
            )}
            {signupState?.success && (
              <p className="text-sm text-green-600 font-medium">{signupState.success}</p>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <Button
                formAction={loginDispatch}
                className="w-full"
                disabled={isPending}
              >
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                formAction={signupDispatch}
                variant="outline"
                className="w-full"
                disabled={isPending}
              >
                {isSignupPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

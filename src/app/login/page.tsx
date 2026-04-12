'use client'

import { useMemo, useState } from 'react'
import { useActionState } from 'react'
import { loginAction, signupAction } from './actions'
import {
  loginInitialState,
  signupInitialState,
  type AuthActionType,
} from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const [lastSubmittedAction, setLastSubmittedAction] = useState<AuthActionType>('login')
  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, loginInitialState)
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, signupInitialState)

  const isPending = isLoginPending || isSignupPending
  const feedbackState = useMemo(() => {
    return lastSubmittedAction === 'login' ? loginState : signupState
  }, [lastSubmittedAction, loginState, signupState])

  const feedbackClassName =
    feedbackState.status === 'success'
      ? 'text-sm text-green-600 font-medium'
      : 'text-sm text-red-500 font-medium'

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

            {feedbackState.status !== 'idle' && (
              <p
                className={feedbackClassName}
                role={feedbackState.status === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {feedbackState.message}
              </p>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <Button
                type="submit"
                formAction={loginDispatch}
                className="w-full"
                disabled={isPending}
                onClick={() => setLastSubmittedAction('login')}
              >
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                type="submit"
                formAction={signupDispatch}
                variant="outline"
                className="w-full"
                disabled={isPending}
                onClick={() => setLastSubmittedAction('signup')}
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

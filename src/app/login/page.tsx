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
import { Crown } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950">
      <div className="flex flex-col items-center mb-8 gap-3">
        <Crown className="w-12 h-12 text-amber-400" />
        <h1 className="text-white text-3xl font-bold tracking-tight text-center">
          Dropshipping <span className="text-amber-400">Milionário</span>
        </h1>
      </div>

      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-50">Acesso</CardTitle>
          <CardDescription className="text-zinc-400">
            Entre na sua conta ou crie uma nova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-200">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@exemplo.com"
                required
                disabled={isPending}
                className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-amber-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-200">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="bg-zinc-950 border-zinc-800 text-zinc-50 focus-visible:ring-amber-400"
              />
            </div>

            {feedbackState.status !== 'idle' && (
              <p
                className={feedbackState.status === 'success' ? 'text-sm text-amber-400 font-medium' : 'text-sm text-red-500 font-medium'}
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
                className="w-full bg-amber-400 text-black hover:bg-amber-500"
                disabled={isPending}
                onClick={() => setLastSubmittedAction('login')}
              >
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button
                type="submit"
                formAction={signupDispatch}
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
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

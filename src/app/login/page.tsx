'use client'

import { useMemo, useState, useEffect } from 'react'
import { useActionState } from 'react'
import { loginAction, signupAction, resetPasswordAction, updatePasswordAction } from './actions'
import {
  loginInitialState,
  signupInitialState,
  resetPasswordInitialState,
  updatePasswordInitialState,
  type AuthActionType,
} from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Crown } from 'lucide-react'

export default function LoginPage() {
  const [lastSubmittedAction, setLastSubmittedAction] = useState<AuthActionType>('login')
  const [isResetMode, setIsResetMode] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  // Checar se veio do e-mail de recuperação ou se deu erro de link expirado
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    // O Supabase às vezes envia os parâmetros na hash (#) dependendo da configuração
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
    
    // Verificar se existe erro de OTP expirado/inválido
    const errorParam = urlParams.get('error') || hashParams.get('error')
    const errorCode = urlParams.get('error_code') || hashParams.get('error_code')
    
    if (errorParam === 'access_denied' && errorCode === 'otp_expired') {
      setUrlError('O link de recuperação é inválido ou expirou. Por favor, solicite um novo link.')
      setIsResetMode(true)
      setLastSubmittedAction('reset_password')
      
      // Limpa a URL para não ficar mostrando o erro sempre se o usuário atualizar a página
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
      setIsUpdateMode(true)
      setLastSubmittedAction('update_password')
    }
  }, [])

  const [loginState, loginDispatch, isLoginPending] = useActionState(loginAction, loginInitialState)
  const [signupState, signupDispatch, isSignupPending] = useActionState(signupAction, signupInitialState)
  const [resetState, resetDispatch, isResetPending] = useActionState(resetPasswordAction, resetPasswordInitialState)
  const [updateState, updateDispatch, isUpdatePending] = useActionState(updatePasswordAction, updatePasswordInitialState)

  const isPending = isLoginPending || isSignupPending || isResetPending || isUpdatePending
  const feedbackState = useMemo(() => {
    if (lastSubmittedAction === 'update_password') return updateState
    if (lastSubmittedAction === 'reset_password') return resetState
    return lastSubmittedAction === 'login' ? loginState : signupState
  }, [lastSubmittedAction, loginState, signupState, resetState, updateState])

  // Redireciona de volta para o login limpo após sucesso na nova senha
  useEffect(() => {
    if (updateState.status === 'success') {
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    }
  }, [updateState.status])

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
          <CardTitle className="text-2xl text-zinc-50">
            {isUpdateMode ? 'Nova Senha' : isResetMode ? 'Recuperar Senha' : 'Acesso'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isUpdateMode ? 'Crie uma nova senha para sua conta.' : isResetMode ? 'Informe seu e-mail para receber as instruções.' : 'Entre na sua conta ou crie uma nova.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            {!isUpdateMode && (
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
            )}
            
            {isUpdateMode && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-zinc-200">Nova Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                    className="bg-zinc-950 border-zinc-800 text-zinc-50 focus-visible:ring-amber-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-200">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={isPending}
                    className="bg-zinc-950 border-zinc-800 text-zinc-50 focus-visible:ring-amber-400"
                  />
                </div>
              </>
            )}

            {!isResetMode && !isUpdateMode && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-200">Senha</Label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsResetMode(true)
                      setLastSubmittedAction('reset_password')
                    }}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending}
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 focus-visible:ring-amber-400"
                />
              </div>
            )}

            {feedbackState.status !== 'idle' && (
              <p
                className={feedbackState.status === 'success' ? 'text-sm text-amber-400 font-medium' : 'text-sm text-red-500 font-medium'}
                role={feedbackState.status === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {feedbackState.message}
              </p>
            )}

            {urlError && feedbackState.status === 'idle' && (
              <p className="text-sm text-red-500 font-medium" role="alert" aria-live="polite">
                {urlError}
              </p>
            )}

            <div className="flex flex-col gap-2 mt-2">
              {isUpdateMode ? (
                 <>
                   <Button
                     type="submit"
                     formAction={updateDispatch}
                     className="w-full bg-amber-400 text-black hover:bg-amber-500"
                     disabled={isPending || updateState.status === 'success'}
                     onClick={() => setLastSubmittedAction('update_password')}
                   >
                     {updateState.status === 'success' ? 'Redirecionando...' : isUpdatePending ? 'Atualizando...' : 'Atualizar Senha'}
                   </Button>
                   <Button
                     type="button"
                     variant="ghost"
                     className="w-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                     disabled={isPending}
                     onClick={() => {
                       setIsUpdateMode(false)
                       window.history.replaceState({}, document.title, window.location.pathname)
                     }}
                   >
                     Voltar para o login
                   </Button>
                 </>
              ) : isResetMode ? (
                <>
                  <Button
                    type="submit"
                    formAction={resetDispatch}
                    className="w-full bg-amber-400 text-black hover:bg-amber-500"
                    disabled={isPending}
                    onClick={() => setLastSubmittedAction('reset_password')}
                  >
                    {isResetPending ? 'Enviando...' : 'Enviar instruções'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                    disabled={isPending}
                    onClick={() => setIsResetMode(false)}
                  >
                    Voltar para o login
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

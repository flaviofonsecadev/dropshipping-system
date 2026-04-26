"use client"

import Link from "next/link"
import { use, useActionState, useEffect, useMemo, useState } from "react"
import { storefrontLoginAction, storefrontSignupAction } from "./actions"
import {
  storefrontLoginInitialState,
  storefrontSignupInitialState,
  type StorefrontAuthActionState,
  type StorefrontAuthActionType,
} from "./types"

export default function StorefrontLoginPage(props: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ next?: string }>
}) {
  const params = use(props.params)
  const searchParams = props.searchParams ? use(props.searchParams) : undefined

  const storeSlug = params.slug
  const next = typeof searchParams?.next === "string" && searchParams.next.trim() ? searchParams.next.trim() : `/loja/${storeSlug}/checkout`

  const [lastSubmittedAction, setLastSubmittedAction] = useState<StorefrontAuthActionType>("login")
  const [loginState, loginDispatch, isLoginPending] = useActionState(storefrontLoginAction, storefrontLoginInitialState)
  const [signupState, signupDispatch, isSignupPending] = useActionState(storefrontSignupAction, storefrontSignupInitialState)

  const isPending = isLoginPending || isSignupPending

  const feedbackState: StorefrontAuthActionState = useMemo(() => {
    return lastSubmittedAction === "login" ? loginState : signupState
  }, [lastSubmittedAction, loginState, signupState])

  useEffect(() => {
    if (loginState.status === "success" && loginState.message.startsWith("/")) {
      window.location.href = loginState.message
    }
  }, [loginState])

  useEffect(() => {
    if (signupState.status === "success" && signupState.message.startsWith("/")) {
      window.location.href = signupState.message
    }
  }, [signupState])

  const feedbackMessage = () => {
    if (feedbackState.action === "login" && feedbackState.status === "success") {
      return "Login realizado com sucesso! Redirecionando..."
    }
    if (feedbackState.action === "signup" && feedbackState.status === "success" && feedbackState.message.startsWith("/")) {
      return "Conta criada com sucesso! Redirecionando..."
    }
    return feedbackState.message
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/loja/${storeSlug}`} className="text-sm text-zinc-700 hover:text-zinc-900">
            Voltar para a loja
          </Link>
          <Link href={`/loja/${storeSlug}/checkout`} className="text-sm font-medium text-zinc-900 hover:underline">
            Checkout
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="border border-zinc-200 bg-white rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Entrar ou criar conta</h1>
          <p className="text-sm text-zinc-600 mt-1">Use seu e-mail para continuar.</p>

          <form className="mt-6 grid gap-4">
            <input type="hidden" name="store_slug" value={storeSlug} />
            <input type="hidden" name="next" value={next} />

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-800">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                required
                disabled={isPending}
                className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-800">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400"
              />
              <div className="text-xs text-zinc-500">Mínimo de 6 caracteres.</div>
            </div>

            {feedbackState.status !== "idle" && (
              <p
                className={feedbackState.status === "success" ? "text-sm text-emerald-700 font-medium" : "text-sm text-red-600 font-medium"}
                role={feedbackState.status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedbackMessage()}
              </p>
            )}

            <div className="grid gap-2 mt-2">
              <button
                type="submit"
                formAction={loginDispatch}
                disabled={isPending || loginState.status === "success"}
                className="h-11 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-60"
                onClick={() => setLastSubmittedAction("login")}
              >
                {isLoginPending || loginState.status === "success" ? "Entrando..." : "Entrar"}
              </button>

              <button
                type="submit"
                formAction={signupDispatch}
                disabled={isPending || signupState.status === "success"}
                className="h-11 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
                onClick={() => setLastSubmittedAction("signup")}
              >
                {isSignupPending || signupState.status === "success" ? "Cadastrando..." : "Criar conta"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

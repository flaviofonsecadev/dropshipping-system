type AsaasEnv = "sandbox" | "production"

type AsaasErrorItem = { code?: string; description?: string }

export class AsaasError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = "AsaasError"
    this.status = status
    this.code = code
    this.details = details
  }
}

function parseWalletIdFromUnknown(data: unknown): string | null {
  if (data && typeof data === "object") {
    if ("walletId" in data && typeof (data as { walletId?: unknown }).walletId === "string") {
      return (data as { walletId: string }).walletId
    }
    if ("id" in data && typeof (data as { id?: unknown }).id === "string") {
      return (data as { id: string }).id
    }
  }

  if (Array.isArray(data) && data[0] && typeof data[0] === "object") {
    const first = data[0] as { walletId?: unknown; id?: unknown }
    if (typeof first.walletId === "string") return first.walletId
    if (typeof first.id === "string") return first.id
  }

  return null
}

function getAsaasEnv(): AsaasEnv {
  const env = (process.env.ASAAS_ENV ?? "").toLowerCase()
  return env === "production" ? "production" : "sandbox"
}

function getAsaasBaseUrl(): string {
  return getAsaasEnv() === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3"
}

function getUserAgent(): string {
  return process.env.ASAAS_USER_AGENT?.trim() || "DropshippingMilionario"
}

async function asaasRequest<T>(apiKey: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${getAsaasBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": getUserAgent(),
      access_token: apiKey,
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const errors = data && typeof data === "object" && "errors" in data ? (data as { errors?: AsaasErrorItem[] }).errors : undefined
    const first = Array.isArray(errors) ? errors[0] : undefined
    const message = first?.description || "Erro na API do Asaas."
    throw new AsaasError(message, res.status, first?.code, data)
  }

  return data as T
}

export async function retrieveWalletId(apiKey: string): Promise<string> {
  const paths = ["/wallets/", "/myAccount/walletId", "/myAccount/walletId/"]
  let lastError: unknown = null

  for (const p of paths) {
    try {
      const data = await asaasRequest<unknown>(apiKey, p, { method: "GET" })
      const parsed = parseWalletIdFromUnknown(data)
      if (parsed) return parsed
      lastError = new AsaasError("Não foi possível obter o walletId no Asaas.", 500, "wallet_parse_error", data)
    } catch (e) {
      if (e instanceof AsaasError && (e.status === 401 || e.status === 403)) {
        throw e
      }
      lastError = e
    }
  }

  if (lastError instanceof AsaasError) throw lastError
  throw new AsaasError("Não foi possível obter o walletId no Asaas.", 500, "wallet_unknown_error", lastError)
}

export async function validateApiKey(apiKey: string): Promise<void> {
  try {
    await asaasRequest<unknown>(apiKey, "/myAccount/status/", { method: "GET" })
  } catch (e) {
    if (e instanceof AsaasError && e.status === 404) {
      await asaasRequest<unknown>(apiKey, "/myAccount/accountNumber", { method: "GET" })
      return
    }
    throw e
  }
}

type CreateCustomerInput = {
  name: string
  cpfCnpj?: string
  email?: string
  phone?: string
  mobilePhone?: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
}

type CreateCustomerResponse = {
  id: string
}

type ListCustomersResponse = {
  data: Array<{ id: string; cpfCnpj?: string | null; email?: string | null }>
}

export async function getOrCreateCustomer(
  apiKey: string,
  input: CreateCustomerInput
): Promise<string> {
  const cpf = (input.cpfCnpj ?? "").trim()
  if (cpf) {
    const list = await asaasRequest<ListCustomersResponse>(
      apiKey,
      `/customers?cpfCnpj=${encodeURIComponent(cpf)}&limit=1&offset=0`,
      { method: "GET" }
    )
    const existing = list?.data?.[0]?.id
    if (existing) return existing
  }

  const created = await asaasRequest<CreateCustomerResponse>(apiKey, "/customers", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return created.id
}

type PaymentSplit = {
  walletId: string
  fixedValue?: number
  percentualValue?: number
  description?: string
  externalReference?: string
}

export type CreatePaymentInput = {
  customer: string
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED"
  value: number
  installmentCount?: number
  installmentValue?: number
  dueDate: string
  description?: string
  externalReference?: string
  split?: PaymentSplit[]
}

export type CreatePaymentResponse = {
  id: string
  invoiceUrl?: string
  status?: string
}

export async function createPayment(apiKey: string, input: CreatePaymentInput): Promise<CreatePaymentResponse> {
  const payload = {
    customer: input.customer,
    billingType: input.billingType,
    value: input.value,
    installmentCount: input.installmentCount,
    installmentValue: input.installmentValue,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
    splits: input.split,
  }
  return asaasRequest<CreatePaymentResponse>(apiKey, "/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

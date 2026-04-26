export type StorefrontAuthActionType = "login" | "signup"
export type StorefrontAuthActionStatus = "idle" | "success" | "error"

export type StorefrontAuthActionState = {
  action: StorefrontAuthActionType
  status: StorefrontAuthActionStatus
  message: string
}

export const storefrontLoginInitialState: StorefrontAuthActionState = {
  action: "login",
  status: "idle",
  message: "",
}

export const storefrontSignupInitialState: StorefrontAuthActionState = {
  action: "signup",
  status: "idle",
  message: "",
}


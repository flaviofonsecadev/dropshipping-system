export type AuthActionType = 'login' | 'signup'
export type AuthActionStatus = 'idle' | 'error' | 'success'
export type AppRole = 'supplier' | 'reseller' | 'admin'

export type AuthActionState = {
  action: AuthActionType
  status: AuthActionStatus
  message: string
}

export const loginInitialState: AuthActionState = {
  action: 'login',
  status: 'idle',
  message: '',
}

export const signupInitialState: AuthActionState = {
  action: 'signup',
  status: 'idle',
  message: '',
}

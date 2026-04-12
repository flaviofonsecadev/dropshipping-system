export type AuthActionType = 'login' | 'signup' | 'reset_password' | 'update_password'
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

export const resetPasswordInitialState: AuthActionState = {
  action: 'reset_password',
  status: 'idle',
  message: '',
}

export const updatePasswordInitialState: AuthActionState = {
  action: 'update_password',
  status: 'idle',
  message: '',
}

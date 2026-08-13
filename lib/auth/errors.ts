import { AUTH_REQUIRED_CODE } from './constants'

export class AuthRequiredError extends Error {
  code = AUTH_REQUIRED_CODE
  triesRemaining: number

  constructor(triesRemaining = 0) {
    super('Sign in required')
    this.name = 'AuthRequiredError'
    this.triesRemaining = triesRemaining
  }
}

export function isAuthRequiredError(err: unknown): err is AuthRequiredError {
  return err instanceof AuthRequiredError
}

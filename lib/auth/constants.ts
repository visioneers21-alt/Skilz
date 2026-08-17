export const GUEST_TRY_LIMIT = 3

export const GUEST_COOKIE = 'skilz_guest'
export const SESSION_COOKIE = 'skilz_session'
export const GUEST_TRIES_COOKIE = 'skilz_guest_tries'

export const OTP_LENGTH = 6
export const OTP_TTL_MS = 10 * 60 * 1000
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000
/** Stay signed in until explicit logout — refreshed on each visit. */
export const SESSION_TTL_MS = 365 * 24 * 60 * 60 * 1000

export const AUTH_REQUIRED_CODE = 'AUTH_REQUIRED'

export const OAUTH_STATE_COOKIE = 'skilz_oauth_state'
export const OAUTH_REDIRECT_COOKIE = 'skilz_oauth_redirect'
export const OAUTH_STATE_TTL_SEC = 10 * 60

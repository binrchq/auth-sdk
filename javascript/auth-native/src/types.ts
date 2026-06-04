// Types for @binrc/auth-native — no DOM dependencies

/** PKCE parameters generated for an authorization request */
export interface PkceParams {
  verifier: string
  challenge: string
  /** Always 'S256' */
  method: 'S256'
}

/** Parameters for building an OIDC authorization URL */
export interface AuthUrlParams {
  /** Adapter base URL, e.g. "https://auth.binrc.com" */
  authDomain: string
  clientId: string
  /** Custom protocol callback, e.g. "binrc-desktop://auth/callback" */
  redirectUri: string
  scope?: string
  state: string
  nonce: string
  challenge: string
}

/** Token response from /api/oauth/token */
export interface TokenResponse {
  access_token: string
  refresh_token?: string
  id_token?: string
  token_type: string
  expires_in: number
  scope?: string
}

/** Result of exchanging an authorization code */
export interface CodeExchangeParams {
  authDomain: string
  clientId: string
  redirectUri: string
  code: string
  verifier: string
}

/** Result of refreshing tokens */
export interface RefreshParams {
  authDomain: string
  clientId: string
  refreshToken: string
}

/**
 * Device Authorization Grant (RFC 8628) — response from your backend
 * which called POST /api/oauth/device/session (SPIFFE-protected).
 * The SDK's device helper consumes this to poll for tokens.
 */
export interface DeviceSessionResponse {
  device_code: string
  user_code: string
  verification_url: string
  verification_url_complete: string
  expires_in: number
  interval: number
}

/** Device poll result */
export type DevicePollResult =
  | { status: 'pending' }
  | { status: 'slow_down'; interval: number }
  | { status: 'authorized'; tokens: TokenResponse }
  | { status: 'denied' }
  | { status: 'expired' }

/** Device poll options */
export interface DevicePollParams {
  authDomain: string
  clientId: string
  deviceCode: string
  /** Current poll interval in seconds */
  interval: number
  /** AbortSignal to cancel polling */
  signal?: AbortSignal
  /** Called each time a pending response is received */
  onPending?: () => void
}

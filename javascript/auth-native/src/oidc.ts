import type { AuthUrlParams, CodeExchangeParams, RefreshParams, TokenResponse } from './types.js'

/**
 * Build the OIDC authorization URL to open in a WebView or system browser.
 * Points to /api/oauth/auth — Adapter branches by client metadata.dispatch.
 */
export function buildAuthUrl(params: AuthUrlParams): string {
  const url = new URL('/api/oauth/auth', params.authDomain)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('code_challenge', params.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', params.state)
  url.searchParams.set('nonce', params.nonce)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('scope', params.scope ?? 'openid email profile offline_access')
  return url.toString()
}

/**
 * Exchange an authorization code for tokens via /api/oauth/token.
 * Public client: no client_secret required — pass only client_id + code_verifier.
 * Confidential client: set Authorization header in fetchImpl before calling,
 * or pass clientSecret.
 */
export async function exchangeCode(
  params: CodeExchangeParams,
  opts?: { clientSecret?: string; fetchImpl?: typeof fetch },
): Promise<TokenResponse> {
  const f = opts?.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    code_verifier: params.verifier,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
  })

  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (opts?.clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${params.clientId}:${opts.clientSecret}`).toString('base64')
  }

  const res = await f(new URL('/api/oauth/token', params.authDomain).toString(), {
    method: 'POST',
    headers,
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw Object.assign(new Error(err.error_description ?? err.error ?? 'token exchange failed'), {
      code: err.error,
      status: res.status,
    })
  }
  return res.json() as Promise<TokenResponse>
}

/**
 * Refresh an access token via /api/oauth/token.
 */
export async function refreshToken(
  params: RefreshParams,
  opts?: { clientSecret?: string; fetchImpl?: typeof fetch },
): Promise<TokenResponse> {
  const f = opts?.fetchImpl ?? fetch
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
    client_id: params.clientId,
  })

  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (opts?.clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${params.clientId}:${opts.clientSecret}`).toString('base64')
  }

  const res = await f(new URL('/api/oauth/token', params.authDomain).toString(), {
    method: 'POST',
    headers,
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw Object.assign(new Error(err.error_description ?? err.error ?? 'token refresh failed'), {
      code: err.error,
      status: res.status,
    })
  }
  return res.json() as Promise<TokenResponse>
}

/**
 * Revoke a token via /api/oauth/revoke.
 */
export async function revokeToken(
  authDomain: string,
  token: string,
  clientId: string,
  opts?: { clientSecret?: string; fetchImpl?: typeof fetch },
): Promise<void> {
  const f = opts?.fetchImpl ?? fetch
  const body = new URLSearchParams({ token, client_id: clientId })
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (opts?.clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${opts.clientSecret}`).toString('base64')
  }
  await f(new URL('/api/oauth/revoke', authDomain).toString(), {
    method: 'POST', headers, body: body.toString(),
  })
}

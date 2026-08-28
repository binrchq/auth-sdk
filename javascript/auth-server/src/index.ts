import crypto from 'node:crypto'
import * as jose from 'jose'

export interface AuthServerConfig {
  /** The base URL of the auth server (e.g. "https://auth.binrc.com") */
  issuerUrl?: string
  /** The OAuth2 client_id */
  clientId: string
  /** The OAuth2 client_secret (required for token exchange) */
  clientSecret?: string
  /** The default redirect_uri for callbacks */
  redirectUri?: string
  /** Secret key (>=32 bytes) used for encrypting app session cookies */
  sessionSecret?: string
}

export interface SessionPayload {
  accessToken: string
  refreshToken?: string
  idToken?: string
  sub: string
  exp: number
  roles?: string[]
  permissions?: string[]
  isStaff?: boolean
}

export interface UserInfo {
  sub: string
  name?: string
  email?: string
  email_verified?: boolean
  phone?: string
  phone_verified?: boolean
  avatar?: string
}

export class BinrcAuthServer {
  private issuerUrl: string
  private clientId: string
  private clientSecret?: string
  private redirectUri?: string
  private sessionSecret?: string
  private jwks: jose.JWTVerifyGetKey

  constructor(config: AuthServerConfig) {
    this.issuerUrl = (config.issuerUrl ?? 'https://auth.binrc.com').replace(/\/+$/, '')
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
    this.sessionSecret = config.sessionSecret
    this.jwks = jose.createRemoteJWKSet(new URL(`${this.issuerUrl}/.well-known/jwks.json`))
  }

  /**
   * Generate a PKCE verifier and S256 challenge.
   */
  public generatePkce(): { verifier: string; challenge: string } {
    const verifier = crypto.randomBytes(32).toString('base64url')
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
    return { verifier, challenge }
  }

  /**
   * Construct the standard OIDC authorization URL.
   */
  public getAuthorizationUrl(options: {
    redirectUri?: string
    state?: string
    codeChallenge?: string
    scope?: string
  } = {}): string {
    const targetRedirect = options.redirectUri ?? this.redirectUri
    if (!targetRedirect) {
      throw new Error('redirectUri is required')
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: targetRedirect,
      scope: options.scope ?? 'openid profile email offline_access',
      state: options.state ?? crypto.randomBytes(16).toString('base64url'),
    })

    if (options.codeChallenge) {
      params.set('code_challenge', options.codeChallenge)
      params.set('code_challenge_method', 'S256')
    }

    return `${this.issuerUrl}/oauth2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens and verify the ID token.
   */
  public async exchangeCode(options: {
    code: string
    codeVerifier?: string
    redirectUri?: string
  }): Promise<SessionPayload> {
    const targetRedirect = options.redirectUri ?? this.redirectUri
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: options.code,
      client_id: this.clientId,
    })

    if (targetRedirect) body.set('redirect_uri', targetRedirect)
    if (this.clientSecret) body.set('client_secret', this.clientSecret)
    if (options.codeVerifier) body.set('code_verifier', options.codeVerifier)

    const resp = await fetch(`${this.issuerUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      throw new Error(`Token exchange failed: ${resp.status} ${errText}`)
    }

    const data = await resp.json()
    const idToken = data.id_token
    let sub = ''
    let roles: string[] = []
    let permissions: string[] = []
    let isStaff = false

    if (idToken) {
      const claims = await this.verifyIdToken(idToken)
      sub = String(claims.sub ?? '')
      roles = Array.isArray(claims.roles) ? (claims.roles as string[]) : []
      permissions = Array.isArray(claims.permissions) ? (claims.permissions as string[]) : []
      isStaff = Boolean(claims.is_staff || claims.isStaff)
    }

    const expiresIn = Number(data.expires_in ?? 3600)
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken,
      sub,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
      roles,
      permissions,
      isStaff,
    }
  }

  /**
   * Verify an ID token using public JWKS endpoint.
   */
  public async verifyIdToken(idToken: string): Promise<jose.JWTPayload> {
    const { payload } = await jose.jwtVerify(idToken, this.jwks, {
      issuer: this.issuerUrl,
      audience: this.clientId,
    })
    return payload
  }

  /**
   * Fetch UserInfo profile using standard Bearer access token.
   */
  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    const resp = await fetch(`${this.issuerUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!resp.ok) {
      throw new Error(`Failed to fetch userinfo: ${resp.status}`)
    }
    return (await resp.json()) as UserInfo
  }

  /**
   * Helper: Encrypt standard session payload into a cookie-safe base64url string.
   */
  public encryptSession(payload: SessionPayload): string {
    if (!this.sessionSecret) {
      throw new Error('sessionSecret is required to encrypt sessions')
    }
    const key = crypto.createHash('sha256').update(this.sessionSecret).digest()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const jsonStr = JSON.stringify(payload)
    const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf-8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, encrypted, tag]).toString('base64url')
  }

  /**
   * Helper: Decrypt session cookie back into a SessionPayload.
   */
  public decryptSession(encryptedBase64Url: string): SessionPayload | null {
    if (!this.sessionSecret) {
      throw new Error('sessionSecret is required to decrypt sessions')
    }
    try {
      const key = crypto.createHash('sha256').update(this.sessionSecret).digest()
      const buffer = Buffer.from(encryptedBase64Url, 'base64url')
      if (buffer.length < 28) return null

      const iv = buffer.subarray(0, 12)
      const tag = buffer.subarray(buffer.length - 16)
      const ciphertext = buffer.subarray(12, buffer.length - 16)

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(tag)

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8')
      const payload = JSON.parse(decrypted) as SessionPayload

      if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
        return null // expired
      }

      return payload
    } catch {
      return null
    }
  }
}

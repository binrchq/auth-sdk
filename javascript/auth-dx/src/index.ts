// @binrc/auth-dx — Read-only access to public DX cookies
// No encryption keys, no write capability — safe for third-party use

export interface ClientAuthInfo {
  v: 1
  isOptedOut?: boolean
  loggedInWithOneTap?: boolean
  user: {
    sub: string
    name?: string
    email?: string
    phone?: string
    avatar?: string
    connectionType?: number
    email_verified?: boolean
    ts: number
  }
}

export interface HlibInfo {
  v: 1
  initialized: boolean
  firstVisit: number
  sessionCount: number
  lastVisit: number
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function parseSignedPayload<T>(raw: string): T | null {
  try {
    const dot = raw.indexOf('.')
    const b64 = dot >= 0 ? raw.slice(0, dot) : raw
    const base64 = b64.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export type DeployMode = 'default' | 'staff'

function publicPrefix(mode: DeployMode): string {
  return mode === 'staff' ? 'brcs' : 'brc'
}

function tenantPrefix(mode: DeployMode): string {
  return mode === 'staff' ? 'binrc-staff-auth' : 'binrc-auth'
}

export class AuthDx {
  private pub: string
  private tenant: string

  constructor(mode: DeployMode = 'default') {
    this.pub = publicPrefix(mode)
    this.tenant = tenantPrefix(mode)
  }

  /** Public user info cookie (name, email, avatar) */
  getClientAuthInfo(): ClientAuthInfo | null {
    const raw = getCookie(`${this.pub}-client-auth-info`)
    if (!raw) return null
    return parseSignedPayload<ClientAuthInfo>(raw)
  }

  /** Visit history cookie */
  getHlib(): HlibInfo | null {
    const raw = getCookie(`${this.pub}-hlib`)
    if (!raw) return null
    return parseSignedPayload<HlibInfo>(raw)
  }

  /** Device ID (persistent, 2-year TTL) */
  getDeviceId(): string | null {
    return getCookie(`${this.pub}-did`)
  }

  /** Language preference */
  getLang(): string | null {
    return getCookie(`${this.pub}-gn`)
  }

  /** Region */
  getRegion(): string | null {
    return getCookie(`${this.pub}-region`)
  }
}

// Default instance — works for any third-party app
export const authDx = new AuthDx('default')

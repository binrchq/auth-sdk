import type { AuthClientConfig, Identity } from './types.js'
import { checkSession } from './session.js'
import { onSessionExpired } from './events.js'

export interface SignInOptions {
  /**
   * passive=true: top-level passive redirect chain.
   * If not logged in, redirects back to returnTo?login_required=1.
   */
  passive?: boolean
  /** Path to return to after login. Defaults to current URL. */
  returnTo?: string
  /** Override the client-level windowMode for this call. */
  windowMode?: import('./types.js').WindowMode
}

const POPUP_MSG = 'binrc_auth_done'

const LOADING_PAGE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Loading</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0b0f19;color:#f3f4f6;font-family:system-ui,-apple-system,sans-serif"><div style="text-align:center"><div style="width:36px;height:36px;border:2.5px solid rgba(255,255,255,.06);border-top-color:#3b82f6;border-radius:50%;animation:s .7s linear infinite;margin:0 auto 16px"></div><p style="font-size:13px;opacity:.5;margin:0">正在连接...</p></div><style>@keyframes s{to{transform:rotate(360deg)}}</style></body></html>`

export class AuthClient {
  private config: Required<AuthClientConfig>

  constructor(config: AuthClientConfig) {
    this.config = {
      sessionEndpoint: '/api/me',
      loginEndpoint: '/auth/login',
      prepareEndpoint: '/auth/prepare',
      fedcmTokenExchangeEndpoint: '/auth/fedcm-exchange',
      fedcm: true,
      fedcmConfig: {},
      windowMode: config.prepareEndpoint !== undefined ? 'popup' : 'redirect',
      passive: true,
      ...config,
    }
  }

  async checkSession(): Promise<Identity | null> {
    return checkSession(this.config) as Promise<Identity | null>
  }

  /**
   * Initiate sign-in.
   *
   * FedCM is a page-level concern handled by useAuth() on mount — it runs
   * concurrently and independently of the login button. signIn() is the pure
   * OAuth path: popup/tab (handoff) or top-level redirect (thirdparty).
   *
   * Degradation:
   *   1. windowMode='popup'/'tab' + prepareEndpoint → open window, postMessage on done
   *   2. popup/tab blocked → fall back to redirect
   *   3. windowMode='redirect' → top-level navigate to /auth/login
   */
  async signIn(opts: SignInOptions = {}): Promise<void> {
    const { passive = false } = opts
    const returnTo = opts.returnTo ?? window.location.pathname + window.location.search
    const effectiveMode = opts.windowMode ?? this.config.windowMode

    if (passive) {
      window.location.replace(this._loginUrl({ passive: true, returnTo }))
      return
    }

    if (effectiveMode === 'redirect') {
      window.location.href = this._loginUrl({ returnTo })
      return
    }

    // popup or tab — only available when prepareEndpoint is configured
    if (this.config.prepareEndpoint) {
      const status = await this._signInWindow(returnTo, effectiveMode as 'popup' | 'tab')
      if (status === 'success' || status === 'closed') return
    }

    // fallback: top-level redirect
    window.location.href = this._loginUrl({ returnTo })
  }

  signOut(opts: { returnTo?: string } = {}): void {
    const returnTo = opts.returnTo ?? window.location.origin + '/'
    fetch('/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    window.location.href = returnTo
  }

  onSessionExpired(callback: () => void): () => void {
    return onSessionExpired(callback)
  }

  destroy(): void {}

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async _signInWindow(returnTo: string, mode: 'popup' | 'tab'): Promise<'success' | 'blocked' | 'closed'> {
    const u = new URL(returnTo, window.location.origin)
    u.searchParams.set('binrc_popup', '1')
    const returnToWithFlag = u.pathname + u.search + u.hash

    let popupUrl: string
    try {
      const res = await fetch(
        `${this.config.prepareEndpoint}?return_to=${encodeURIComponent(returnToWithFlag)}`,
        { method: 'POST', credentials: 'include' },
      )
      if (!res.ok) return 'blocked'
      const data = await res.json() as { intent_id?: string; prepare_url?: string }
      if (!data.intent_id || !data.prepare_url) return 'blocked'
      const pu = new URL(data.prepare_url)
      pu.searchParams.set('intent', data.intent_id)
      popupUrl = pu.toString()
    } catch {
      return 'blocked'
    }

    let win: Window | null
    if (mode === 'tab') {
      win = window.open('about:blank', 'binrc_login')
    } else {
      const w = 960, h = 640
      const left = Math.round(window.screenX + (window.outerWidth - w) / 2)
      const top = Math.round(window.screenY + (window.outerHeight - h) / 2)
      win = window.open('about:blank', 'binrc_login',
        `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`)
    }

    if (!win) return 'blocked'

    // Write loading page immediately to avoid blank flash
    try {
      win.document.write(LOADING_PAGE_HTML)
      win.document.close()
    } catch {}

    win.location.href = popupUrl

    return new Promise((resolve) => {
      const onMessage = (e: MessageEvent) => {
        const authOrigin = new URL(this.config.authDomain).origin
        const isFromAuth = e.origin === authOrigin
        const isFromSelf = e.origin === window.location.origin
        if (!isFromAuth && !isFromSelf) return
        if ((e.data as any)?.type === POPUP_MSG) { cleanup(); resolve('success') }
      }
      const timer = setInterval(() => { if (win!.closed) { cleanup(); resolve('closed') } }, 400)
      function cleanup() { clearInterval(timer); window.removeEventListener('message', onMessage) }
      window.addEventListener('message', onMessage)
    })
  }

  private _loginUrl(opts: { passive?: boolean; returnTo?: string }): string {
    const base = this.config.loginEndpoint
    const params = new URLSearchParams()
    if (opts.returnTo) params.set('return_to', opts.returnTo)
    if (opts.passive) params.set('passive', '1')
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  private _supportsFedCM(): boolean {
    if (this.config.fedcm === false) return false
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    return 'IdentityCredential' in window && typeof (navigator as any).credentials?.get === 'function'
  }

  async trySilentSignIn(): Promise<boolean> {
    if (!this._supportsFedCM()) return false
    const token = await this._tryFedCM('silent')
    if (token) {
      return await this._exchangeFedcmToken(token)
    }
    return false
  }

  async triggerFedCMPrompt(): Promise<boolean> {
    if (!this._supportsFedCM()) return false
    this._tryFedCM('optional').then(async (token) => {
      if (token) {
        const ok = await this._exchangeFedcmToken(token)
        if (ok) window.location.reload()
      }
    }).catch(() => {})
    return true
  }

  private _fedcmPromise: Promise<string | null> | null = null

  private async _tryFedCM(mediation: CredentialMediationRequirement = 'required'): Promise<string | null> {
    if (this._fedcmPromise) return this._fedcmPromise

    this._fedcmPromise = (async () => {
      const nonce = this._makeNonce()
      try {
        const cred = await (navigator as any).credentials.get({
          identity: {
            providers: [{
              configURL: `${this.config.authDomain}/.well-known/fedcm/config.json`,
              clientId: this.config.clientId,
              nonce,
            }],
            context: 'signin',
          },
          mediation,
        })
        return cred?.token ?? null
      } catch (err: any) {
        if (err?.name !== 'NotSupportedError') {
          console.debug('[binrc] FedCM:', err?.name, err?.message)
        }
        return null
      } finally {
        this._fedcmPromise = null
      }
    })()

    return this._fedcmPromise
  }

  private async _exchangeFedcmToken(idToken: string): Promise<boolean> {
    try {
      const res = await fetch(this.config.fedcmTokenExchangeEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  private _makeNonce(): string {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
}

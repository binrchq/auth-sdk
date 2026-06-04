/**
 * components.tsx — consolidated React components for the Binrc Auth SDK.
 *
 * Exports: AuthContext, AuthProvider, useAuthContext,
 *          BinrcLoginButton, OneTapPrompt, RequireAuth
 */
import React from 'react'
import type {
  AuthClientConfig,
  FedCMConfig,
  WindowMode,
} from '../types.js'
import { AuthClient } from '../client.js'
import { useAuth } from './hooks.js'

// ---------------------------------------------------------------------------
// AuthContext / AuthProvider / useAuthContext
// ---------------------------------------------------------------------------

export interface AuthProviderProps {
  children: React.ReactNode
  config: AuthClientConfig
  /** Merged with config.fedcmConfig */
  fedcmConfig?: FedCMConfig
  /** Overrides config.windowMode for this subtree */
  windowMode?: WindowMode
}

export type AuthContextValue = ReturnType<typeof useAuth>

export const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  config,
  fedcmConfig,
  windowMode,
}: AuthProviderProps) {
  const mergedConfig = React.useMemo(
    () => ({
      ...config,
      ...(fedcmConfig && {
        fedcmConfig: { ...config.fedcmConfig, ...fedcmConfig },
      }),
      ...(windowMode !== undefined && { windowMode }),
    }),
    [config, fedcmConfig, windowMode],
  )

  const auth = useAuth(mergedConfig)
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook — returns the current auth context value.
 * Throws if called outside an <AuthProvider>.
 */
export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// BinrcLoginButton
// ---------------------------------------------------------------------------

export interface BinrcLoginButtonProps {
  config: AuthClientConfig
  onSuccess?: () => void
  /**
   * - "outline" (default) — white bg, border, logo + label inline
   * - "filled"            — brand purple bg, white text
   * - "icon"              — logo only
   * - "default"           — alias for "outline"
   */
  variant?: 'default' | 'outline' | 'filled' | 'icon'
  /** Default: "使用 Binrc 登录" */
  label?: string
  children?: React.ReactNode
  block?: boolean
  style?: React.CSSProperties
  className?: string
  returnTo?: string
  windowMode?: WindowMode
}

function BinrcLogoSVG({ size = 18 }: { size?: number }) {
  const clipId = React.useId()
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1700 1700"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M838 96c-401.7 0-727.4 335.8-727.4 750s325.7 750 727.4 750c401.7 0 727.4-335.8 727.4-750S1239.7 96 838 96z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} transform="matrix(1.1145977,0,0,1.1144444,-83.607839,-89.986662)">
        <path
          fill="#20e091"
          fillRule="evenodd"
          d="m838 96c-401.7 0-727.4 335.8-727.4 750 0 414.2 325.7 750 727.4 750 401.7 0 727.4-335.8 727.4-750C1565.4 431.8 1239.7 96 838 96zm446.9 944.6c-24.4 59.5-59.4 113-104 159-44.6 46-96.5 82.1-154.2 107.3-59.6 26-123.1 39.2-188.7 39.2-65.6 0-129-13.2-188.7-39.2-57.7-25.2-109.6-61.3-154.2-107.3-44.6-46-79.6-99.5-104-159-25.2-61.5-38-127-38-194.6 0-67.6 12.8-133.1 38-194.6 24.4-59.5 59.4-113 104-159 44.6-46 96.5-82.1 154.2-107.3C709 359.2 772.4 346 838 346c65.6 0 129 13.2 188.7 39.2 57.7 25.2 109.6 61.3 154.2 107.3 44.6 46 79.6 99.5 104 159 25.2 61.5 38 126.9 38 194.6 0 67.7-12.8 133-38 194.5zm246.6-626.2c74.9 0 135.7 60.8 135.7 135.7v592.2c0 74.9-60.8 135.7-135.7 135.7-74.9 0-135.7-60.8-135.7-135.7V550.1c0-74.9 60.8-135.7 135.7-135.7zm0 40c52.8 0 95.7 42.8 95.7 95.7v583.6c0 52.8-42.8 95.7-95.7 95.7-52.9 0-95.7-42.8-95.7-95.7V550.1c0-52.9 42.9-95.7 95.7-95.7zm-1389.9-40c74.9 0 135.7 60.8 135.7 135.7v592.2c0 74.9-60.8 135.7-135.7 135.7C66.7 1278 5.9 1217.2 5.9 1142.3V550.1c0-74.9 60.8-141.6 141.6-141.6zm0 40c52.8 0 95.7 42.8 95.7 95.7v583.6c0 52.8-42.8 95.7-95.7 95.7-52.9 0-95.7-42.8-95.7-95.7V550.1c0-52.9 42.9-95.7 95.7-95.7z"
        />
      </g>
    </svg>
  )
}

export function BinrcLoginButton({
  config,
  onSuccess,
  variant = 'outline',
  label,
  children,
  block = false,
  style,
  className,
  returnTo,
  windowMode,
}: BinrcLoginButtonProps) {
  const clientRef = React.useRef<AuthClient | null>(null)
  if (!clientRef.current) clientRef.current = new AuthClient(config)

  const [busy, setBusy] = React.useState(false)
  const effectiveVariant = variant === 'default' ? 'outline' : variant
  const buttonLabel = children ?? label ?? '使用 Binrc 登录'

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await clientRef.current!.signIn({ windowMode, returnTo })
      onSuccess?.()
    } finally {
      setBusy(false)
    }
  }

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: busy ? 'wait' : 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    opacity: busy ? 0.7 : 1,
    transition: 'opacity 120ms',
    width: block ? '100%' : undefined,
  }

  if (effectiveVariant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={className}
        aria-label={typeof buttonLabel === 'string' ? buttonLabel : '使用 Binrc 登录'}
        title={typeof buttonLabel === 'string' ? buttonLabel : '使用 Binrc 登录'}
        style={{ ...base, width: 40, height: 40, padding: 0, background: '#fff', border: '1px solid #dadce0', borderRadius: 4, boxShadow: '0 1px 2px rgba(60,64,67,.08)', ...style }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#f8f8f8' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
      >
        <BinrcLogoSVG />
      </button>
    )
  }

  if (effectiveVariant === 'filled') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={className}
        aria-label={typeof buttonLabel === 'string' ? buttonLabel : '使用 Binrc 登录'}
        style={{ ...base, gap: 10, height: 40, padding: '0 20px', background: '#6344F5', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.01em', ...style }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#7c6af7' }}
        onMouseLeave={e => { if (!busy) e.currentTarget.style.background = '#6344F5' }}
      >
        <BinrcLogoSVG />
        {busy ? '登录中…' : buttonLabel}
      </button>
    )
  }

  // outline / default
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className}
      aria-label={typeof buttonLabel === 'string' ? buttonLabel : '使用 Binrc 登录'}
      style={{ ...base, gap: 10, height: 40, padding: '0 16px', background: '#fff', color: '#3c4043', border: '1px solid #dadce0', borderRadius: 4, fontSize: 14, fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.01em', boxShadow: '0 1px 2px rgba(60,64,67,.08)', ...style }}
      onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#f8f8f8' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
    >
      <BinrcLogoSVG />
      {busy ? '登录中…' : buttonLabel}
    </button>
  )
}

// ---------------------------------------------------------------------------
// OneTapPrompt
// ---------------------------------------------------------------------------

interface HintUser {
  name?: string
  email?: string
  avatar?: string
  sub?: string
}

function readHintCookie(): HintUser | null {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.split('; ').find(c => c.startsWith('brc-client-auth-info='))
    if (!match) return null
    const raw = decodeURIComponent(match.slice('brc-client-auth-info='.length))
    try { return JSON.parse(raw) } catch { /* fall through */ }
    const parts = raw.split('.')
    if (parts.length >= 2) {
      const pad = (s: string) => s + '=='.slice((s.length % 4) || 4)
      try { return JSON.parse(atob(pad(parts[0].replace(/-/g, '+').replace(/_/g, '/')))) } catch { /* fall through */ }
    }
    return null
  } catch {
    return null
  }
}

const SESSION_DISMISS_KEY = 'binrc_onetap_dismissed'

function HintAvatar({ src, name, size = 40 }: { src?: string; name?: string; size?: number }) {
  const initials = (name || '?').slice(0, 1).toUpperCase()
  if (src) {
    return (
      <img src={src} alt={name} width={size} height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #6344F5 0%, #20e091 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export interface OneTapPromptProps {
  config: AuthClientConfig
  onSuccess?: () => void
  onDismiss?: () => void
  siteName?: string
  privacyUrl?: string
  termsUrl?: string
  /** Auto-dismiss after N ms (default 8000, 0 to disable) */
  autoCloseMs?: number
  windowMode?: WindowMode
}

export function OneTapPrompt({
  config,
  onSuccess,
  onDismiss,
  siteName,
  privacyUrl = 'https://binrc.com/legal/privacy',
  termsUrl = 'https://binrc.com/legal/terms',
  autoCloseMs = 8000,
  windowMode,
}: OneTapPromptProps) {
  const [visible, setVisible] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [hint, setHint] = React.useState<HintUser | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const clientRef = React.useRef<AuthClient | null>(null)
  if (!clientRef.current) clientRef.current = new AuthClient(config)

  const site = siteName ?? (typeof window !== 'undefined' ? window.location.hostname : '')

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return
    const h = readHintCookie()
    if (h?.email || h?.name) {
      setHint(h)
      setVisible(true)
      if (autoCloseMs > 0) {
        timerRef.current = setTimeout(dismiss, autoCloseMs)
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current)
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    setVisible(false)
    onDismiss?.()
  }

  async function handleContinue() {
    if (busy) return
    setBusy(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      await clientRef.current!.signIn({ windowMode })
      setVisible(false)
      onSuccess?.()
    } finally {
      setBusy(false)
    }
  }

  if (!visible || !hint) return null
  const displayName = hint.name || hint.email?.split('@')[0] || ''

  return (
    <div role="dialog" aria-modal="false" aria-label={`使用 binrc 账号登录 ${site}`}
      style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, width: 360, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.08)', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', overflow: 'hidden', animation: 'binrc_onetap_in 220ms cubic-bezier(0.22,1,0.36,1)' }}
    >
      <style>{`@keyframes binrc_onetap_in{from{opacity:0;transform:translateY(-12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <BinrcLogoSVG size={20} />
        <span style={{ flex: 1, fontSize: 13, color: '#444', fontWeight: 500, lineHeight: 1.3 }}>
          使用 binrc 账号登录 <span style={{ color: '#111', fontWeight: 600 }}>{site}</span>
        </span>
        <button onClick={dismiss} aria-label="关闭"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 18, lineHeight: 1, padding: '2px 4px', borderRadius: 4, flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#333' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999' }}>×</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' }}>
        <HintAvatar src={hint.avatar} name={displayName} size={44} />
        <div style={{ minWidth: 0 }}>
          {displayName && <div style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>}
          {hint.email && <div style={{ fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hint.email}</div>}
        </div>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <button onClick={handleContinue} disabled={busy}
          style={{ width: '100%', height: 42, background: busy ? '#8a78f7' : '#6344F5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', transition: 'background 120ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#7c6af7' }}
          onMouseLeave={e => { if (!busy) e.currentTarget.style.background = '#6344F5' }}>
          {busy ? '登录中…' : (displayName ? `以"${displayName}"的身份继续` : '继续登录')}
        </button>
      </div>
      <div style={{ padding: '0 16px 16px', fontSize: 11, color: '#888', lineHeight: 1.6 }}>
        如果您继续，binrc 会将您的姓名、邮箱和个人资料照片分享给此网站。您可查看此网站的{' '}
        <a href={privacyUrl} target="_blank" rel="noreferrer" style={{ color: '#6344F5', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>隐私政策</a>
        和{' '}
        <a href={termsUrl} target="_blank" rel="noreferrer" style={{ color: '#6344F5', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>服务条款</a>。
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RequireAuth
// ---------------------------------------------------------------------------

export interface RequireAuthProps {
  children: React.ReactNode
  /** Shown while session is being checked (default: null) */
  fallback?: React.ReactNode
  /**
   * Custom render when the user is not authenticated.
   * If omitted, redirects to loginEndpoint with ?return_to= set to the
   * current URL.
   */
  renderUnauthenticated?: (ctx: { signIn: () => void }) => React.ReactNode
}

export function RequireAuth({
  children,
  fallback = null,
  renderUnauthenticated,
}: RequireAuthProps) {
  const auth = useAuthContext()

  if (auth.loading) return <>{fallback}</>

  if (!auth.identity) {
    if (renderUnauthenticated) {
      return <>{renderUnauthenticated({ signIn: () => auth.signIn() })}</>
    }
    // Redirect to login — use auth.signIn() which respects the configured
    // loginEndpoint and windowMode, or fall back to a hard navigation.
    if (typeof window !== 'undefined') {
      auth.signIn()
    }
    return null
  }

  return <>{children}</>
}

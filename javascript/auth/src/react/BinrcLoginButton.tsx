import React from 'react'
import type { AuthClientConfig, WindowMode } from '../types.js'
import { AuthClient } from '../client.js'

export interface BinrcLoginButtonProps {
  config: AuthClientConfig
  onSuccess?: () => void
  /**
   * - "outline" (default) — white bg, border, logo + label inline
   * - "filled"            — brand purple bg, white text
   * - "icon"              — logo only
   */
  variant?: 'outline' | 'filled' | 'icon'
  /** Default: "使用 binrc 登录" */
  label?: string
  block?: boolean
  style?: React.CSSProperties
  className?: string
  /** Override the client-level windowMode for this button */
  windowMode?: WindowMode
}

function Logo({ size = 18 }: { size?: number }) {
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
  label = '使用 binrc 登录',
  block = false,
  style,
  className,
  windowMode,
}: BinrcLoginButtonProps) {
  const clientRef = React.useRef<AuthClient | null>(null)
  if (!clientRef.current) clientRef.current = new AuthClient(config)

  const [busy, setBusy] = React.useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await clientRef.current!.signIn({ windowMode })
      onSuccess?.()
    } finally {
      setBusy(false)
    }
  }

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: busy ? 'wait' : 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    opacity: busy ? 0.7 : 1,
    transition: 'opacity 120ms',
  }

  if (variant === 'outline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={className}
        aria-label={label}
        style={{
          ...baseStyle,
          gap: 10,
          height: 40,
          padding: '0 16px',
          background: '#fff',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Google Sans', Roboto, system-ui, -apple-system, sans-serif",
          letterSpacing: '0.01em',
          width: block ? '100%' : undefined,
          boxShadow: '0 1px 2px rgba(60,64,67,.08)',
          ...style,
        }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#f8f8f8' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
      >
        <Logo />
        {busy ? '登录中…' : label}
      </button>
    )
  }

  if (variant === 'filled') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={className}
        aria-label={label}
        style={{
          ...baseStyle,
          gap: 10,
          height: 40,
          padding: '0 20px',
          background: '#6344F5',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Google Sans', Roboto, system-ui, -apple-system, sans-serif",
          letterSpacing: '0.01em',
          width: block ? '100%' : undefined,
          ...style,
        }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#7c6af7' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#6344F5' }}
      >
        <Logo />
        {busy ? '登录中…' : label}
      </button>
    )
  }

  // icon variant
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className}
      aria-label={label}
      title={label}
      style={{
        ...baseStyle,
        width: 40,
        height: 40,
        padding: 0,
        background: '#fff',
        border: '1px solid #dadce0',
        borderRadius: 4,
        boxShadow: '0 1px 2px rgba(60,64,67,.08)',
        ...style,
      }}
    >
      <Logo />
    </button>
  )
}

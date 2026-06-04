import React from 'react'
import type { AuthClientConfig, FedCMConfig, WindowMode } from '../types.js'
import { useAuth } from './hooks.js'

export interface RequireAuthProps {
  children: React.ReactNode
  /** Shown while checking session (default: null) */
  fallback?: React.ReactNode
  /** Custom render when not authenticated — receives signIn handler */
  renderUnauthenticated?: (ctx: { signIn: () => void }) => React.ReactNode
}

export function RequireAuth({
  children,
  fallback = null,
  renderUnauthenticated,
}: RequireAuthProps) {
  const auth = useAuthContext()
  if (!auth) throw new Error('RequireAuth must be used inside <AuthProvider>')

  if (auth.loading) return <>{fallback}</>

  if (!auth.identity) {
    if (renderUnauthenticated) {
      return <>{renderUnauthenticated({ signIn: () => auth.signIn() })}</>
    }
    return null
  }

  return <>{children}</>
}

export interface AuthProviderProps {
  children: React.ReactNode
  config: AuthClientConfig
  /** Convenience override for fedcmConfig — merged with config.fedcmConfig */
  fedcmConfig?: FedCMConfig
  /** Convenience override for windowMode */
  windowMode?: WindowMode
}

const AuthContext = React.createContext<ReturnType<typeof useAuth> | null>(null)

export function AuthProvider({ children, config, fedcmConfig, windowMode }: AuthProviderProps) {
  const mergedConfig = React.useMemo(() => ({
    ...config,
    ...(fedcmConfig && { fedcmConfig: { ...config.fedcmConfig, ...fedcmConfig } }),
    ...(windowMode !== undefined && { windowMode }),
  }), [config, fedcmConfig, windowMode])

  const auth = useAuth(mergedConfig)
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return React.useContext(AuthContext)
}

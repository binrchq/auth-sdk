import { useState, useEffect, useCallback, useRef } from 'react'
import type { AuthClientConfig, Identity, AuthStage } from '../types.js'
import { checkSession } from '../session.js'
import { AuthClient } from '../client.js'
import { onSessionExpired } from '../events.js'

export function useAuth(config: AuthClientConfig) {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [stage, setStage] = useState<AuthStage>('checking')
  const [loginRequired, setLoginRequired] = useState(false)

  const configRef = useRef(config)
  configRef.current = config

  const clientRef = useRef<AuthClient | null>(null)
  if (!clientRef.current) {
    clientRef.current = new AuthClient(config)
  }

  // Consume ?login_required=1 from URL (set by passive redirect when not logged in)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.has('login_required')) {
      setLoginRequired(true)
      params.delete('login_required')
      const newSearch = params.toString()
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash
      window.history.replaceState(null, '', newUrl)
    }
  }, [])

  // If this page is running inside a login popup, signal the opener on success or failure
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.opener) return
    const params = new URLSearchParams(window.location.search)
    const isPopup = params.has('binrc_popup') || params.has('popup')
    if (!isPopup) return

    if (stage === 'authenticated' || stage === 'unauthenticated' || loginRequired) {
      try {
        window.opener.postMessage({ type: 'binrc_auth_done' }, '*')
      } catch {
        // opener may have navigated away
      }

      if (stage === 'authenticated' || loginRequired || params.has('error')) {
        params.delete('binrc_popup')
        params.delete('popup')
        const newSearch = params.toString()
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash
        window.history.replaceState(null, '', newUrl)
        window.close()
      }
    }
  }, [stage, loginRequired])

  // Initial session check → optional silent FedCM → show login UI immediately
  // FedCM and OAuth are independent parallel paths; login button is always visible.
  useEffect(() => {
    let cancelled = false
    const fedcmCfg = configRef.current.fedcmConfig ?? {}
    const silentOnLoad = fedcmCfg.silentOnLoad !== false   // default true
    const promptOnLoad = fedcmCfg.promptOnLoad === true    // default false

    checkSession(configRef.current).then(async (session) => {
      if (cancelled) return
      if (session) {
        setIdentity(session as Identity)
        setStage('authenticated')
        return
      }

      // Show login UI immediately — never block on FedCM
      setStage('unauthenticated')

      // Silent FedCM probe runs concurrently in background
      if (silentOnLoad) {
        clientRef.current!.trySilentSignIn().then(async (silentOk) => {
          if (cancelled || !silentOk) return
          const s = await checkSession(configRef.current) as Identity | null
          if (cancelled) return
          if (s) { setIdentity(s); setStage('authenticated') }
        })
      }

      // Optionally trigger FedCM account picker concurrently (non-blocking)
      if (promptOnLoad) {
        clientRef.current!.triggerFedCMPrompt()
      }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-check session when popup signals login done
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: MessageEvent) => {
      const authOrigin = configRef.current.authDomain ? new URL(configRef.current.authDomain).origin : null
      const isFromAuth = authOrigin && e.origin === authOrigin
      const isFromSelf = e.origin === window.location.origin

      if (!isFromAuth && !isFromSelf) return
      if ((e.data as any)?.type !== 'binrc_auth_done') return

      checkSession(configRef.current).then((session) => {
        if (session) {
          setIdentity(session as Identity)
          setStage('authenticated')
          setLoginRequired(false)
        }
      })
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Re-check on session expired — try silent FedCM first, then fall back to unauthenticated
  useEffect(() => {
    return onSessionExpired(async () => {
      const silentOk = await clientRef.current!.trySilentSignIn()
      if (silentOk) {
        const s = await checkSession(configRef.current) as Identity | null
        if (s) { setIdentity(s); setStage('authenticated'); return }
      }
      setIdentity(null)
      setStage('unauthenticated')
      setLoginRequired(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback((opts?: Parameters<AuthClient['signIn']>[0]) => {
    clientRef.current!.signIn(opts)
  }, [])

  const signOut = useCallback((opts?: { returnTo?: string }) => {
    clientRef.current!.signOut(opts)
  }, [])

  const refresh = useCallback(async () => {
    const s = await checkSession(configRef.current) as Identity | null
    setIdentity(s)
    if (s) setStage('authenticated')
    return s
  }, [])

  return {
    identity,
    stage,
    loginRequired,
    loading: stage === 'checking',
    signIn,
    signOut,
    refresh,
    login: signIn,
    logout: signOut,
  }
}

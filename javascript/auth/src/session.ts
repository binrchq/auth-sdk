import type { AuthClientConfig } from './types.js'

export async function checkSession(config: AuthClientConfig): Promise<unknown | null> {
  const endpoint = config.sessionEndpoint ?? '/api/me'
  try {
    const res = await fetch(endpoint, { credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

import type { DevicePollParams, DevicePollResult, TokenResponse } from './types.js'

/**
 * Poll /api/oauth/device/token until authorized, denied, or expired.
 *
 * This is a single poll tick — call it in a loop managed by your application,
 * or use `pollUntilDone()` for a fully managed loop.
 *
 * The Adapter endpoint is SPIFFE-protected, so your backend must proxy this call.
 * From Electron/Tauri main process, call your own backend endpoint which calls
 * POST /api/oauth/device/token with SPIFFE SVID.
 *
 * If you are the backend itself (Node.js), call the Adapter directly with SVID.
 */
export async function pollDeviceToken(
  params: Pick<DevicePollParams, 'authDomain' | 'clientId' | 'deviceCode'>,
  opts?: { fetchImpl?: typeof fetch },
): Promise<DevicePollResult> {
  const f = opts?.fetchImpl ?? fetch
  const res = await f(new URL('/api/oauth/device/token', params.authDomain).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_code: params.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      client_id: params.clientId,
    }),
  })

  if (res.status === 200) {
    const tokens = await res.json() as TokenResponse
    return { status: 'authorized', tokens }
  }

  const body = await res.json().catch(() => ({})) as any
  const error = body?.error

  if (res.status === 428 || error === 'authorization_pending') return { status: 'pending' }
  if (res.status === 403 && error === 'slow_down') return { status: 'slow_down', interval: 5 }
  if (res.status === 403 && error === 'access_denied') return { status: 'denied' }
  if (res.status === 400 && error === 'expired_token') return { status: 'expired' }

  throw Object.assign(new Error(error ?? 'device poll failed'), { status: res.status })
}

/**
 * Managed poll loop: polls at the given interval until authorized/denied/expired
 * or the AbortSignal fires.
 *
 * @param params.interval - initial poll interval in seconds (from DeviceSessionResponse)
 * @param params.onPending - optional callback on each pending tick
 * @returns tokens on success; throws on denied, expired, or abort
 */
export async function pollUntilDone(
  params: DevicePollParams,
  opts?: { fetchImpl?: typeof fetch },
): Promise<TokenResponse> {
  let interval = params.interval ?? 5
  const signal = params.signal

  while (true) {
    if (signal?.aborted) throw new Error('device_poll_aborted')

    await sleep(interval * 1000, signal)

    const result = await pollDeviceToken(
      { authDomain: params.authDomain, clientId: params.clientId, deviceCode: params.deviceCode },
      opts,
    )

    if (result.status === 'authorized') return result.tokens
    if (result.status === 'denied') throw Object.assign(new Error('access_denied'), { code: 'access_denied' })
    if (result.status === 'expired') throw Object.assign(new Error('expired_token'), { code: 'expired_token' })
    if (result.status === 'slow_down') interval += result.interval
    if (result.status === 'pending') params.onPending?.()
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('device_poll_aborted')) }, { once: true })
  })
}

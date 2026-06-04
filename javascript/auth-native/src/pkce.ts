import type { PkceParams } from './types.js'

// Works in Node.js 18+ (globalThis.crypto) and browser WebCrypto — no DOM types needed.

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined') return globalThis.crypto
  throw new Error('[auth-native] WebCrypto not available. Requires Node.js 18+ or a browser.')
}

function base64url(buf: ArrayBuffer): string {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Generate a random base64url string of `byteLength` bytes */
export function randomBase64url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  getCrypto().getRandomValues(bytes)
  return base64url(bytes.buffer)
}

/** Generate a PKCE verifier + S256 challenge pair */
export async function generatePkce(): Promise<PkceParams> {
  const verifier = randomBase64url(32)
  const encoder = new TextEncoder()
  const digest = await getCrypto().subtle.digest('SHA-256', encoder.encode(verifier))
  const challenge = base64url(digest)
  return { verifier, challenge, method: 'S256' }
}

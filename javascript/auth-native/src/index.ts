// @binrc/auth-native — native client authentication helpers
// No DOM dependencies. Works in Node.js 18+, Electron main process, Tauri Rust side (via FFI or sidecar), CLI.
//
// Usage patterns:
//   Electron/Tauri (internal app):  generatePkce → buildAuthUrl → open WebView → intercept redirect → exchangeCode
//   Electron/Tauri (device flow):   backend calls /api/oauth/device/session → pollUntilDone (via backend proxy)
//   CLI / IoT:                      backend calls /api/oauth/device/session → pollUntilDone

export { generatePkce, randomBase64url } from './pkce.js'
export { buildAuthUrl, exchangeCode, refreshToken, revokeToken } from './oidc.js'
export { pollDeviceToken, pollUntilDone } from './device.js'
export type {
  PkceParams,
  AuthUrlParams,
  TokenResponse,
  CodeExchangeParams,
  RefreshParams,
  DeviceSessionResponse,
  DevicePollResult,
  DevicePollParams,
} from './types.js'

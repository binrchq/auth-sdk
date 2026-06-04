// onetap.ts — removed in v8.0.
// The /onetap cross-origin iframe model is no longer supported.
// Cross-site iframes cannot read SameSite=Lax cookies (the session-token),
// so the iframe always sees an unauthenticated state.
//
// Replacement: FedCM (Chrome 117+) for browser-native One Tap UI,
// with top-level passive redirect as the universal fallback.
// See §6 and §17 of client-auth-flows.md.

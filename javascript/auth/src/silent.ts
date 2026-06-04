// silent.ts — removed in v8.0.
// Silent login via hidden iframe is no longer supported.
// Cross-site iframes cannot carry SameSite=Lax cookies, making this path
// non-functional in Chrome/Firefox/Safari with 3rd-party cookie restrictions.
//
// Replacement: top-level passive redirect via AuthClient.signIn({ passive: true })
// or AuthProvider with passive=true. See §6 of client-auth-flows.md.

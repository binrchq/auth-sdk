//! `binrc-auth-native` — Binrc authentication SDK for native clients.
//!
//! Provides PKCE generation, OIDC authorization URL building, token exchange,
//! token refresh, and Device Authorization Grant (RFC 8628) polling.
//!
//! # Adapter endpoints used
//!
//! | Endpoint | Purpose |
//! |---|---|
//! | `GET  /api/oauth/auth`         | Build authorization URL (open in WebView / browser) |
//! | `POST /api/oauth/token`        | Code exchange & refresh — public client, no secret needed |
//! | `POST /api/oauth/revoke`       | Token revocation |
//! | `POST /api/oauth/device/token` | Device code polling (SPIFFE-protected, call via backend) |

pub mod types;
pub mod pkce;
pub mod oidc;
pub mod device;
pub mod error;

pub use types::{
    AuthUrlParams, CodeExchangeParams, DevicePollParams, DevicePollResult, DevicePollStatus,
    DeviceSessionResponse, PkceParams, RefreshParams, TokenError, TokenResponse,
};
pub use pkce::{generate_pkce, random_base64url};
pub use oidc::{build_auth_url, exchange_code, refresh_token, revoke_token};
pub use device::{poll_device_token, poll_until_done};
pub use error::AuthError;

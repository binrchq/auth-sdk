use serde::{Deserialize, Serialize};

/// PKCE verifier + S256 challenge pair.
#[derive(Debug, Clone)]
pub struct PkceParams {
    pub verifier: String,
    pub challenge: String,
    /// Always `"S256"`.
    pub method: &'static str,
}

/// Parameters for building an OIDC authorization URL.
pub struct AuthUrlParams<'a> {
    /// Adapter base URL, e.g. `"https://auth.binrc.com"`.
    pub auth_domain: &'a str,
    pub client_id: &'a str,
    /// Custom scheme or HTTPS callback, e.g. `"binrc-desktop://auth/callback"`.
    pub redirect_uri: &'a str,
    /// Space-separated scopes. Defaults to `"openid email profile offline_access"`.
    pub scope: Option<&'a str>,
    pub state: &'a str,
    pub nonce: &'a str,
    /// PKCE S256 challenge (from [`crate::generate_pkce`]).
    pub challenge: &'a str,
}

/// Token response from `/api/oauth/token`.
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub id_token: Option<String>,
    pub token_type: String,
    pub expires_in: u64,
    pub scope: Option<String>,
}

/// Error returned by token endpoints.
#[derive(Debug, Clone)]
pub struct TokenError {
    pub status: u16,
    pub code: String,
    pub description: String,
}

impl std::fmt::Display for TokenError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Token error {} ({}): {}", self.code, self.status, self.description)
    }
}

impl std::error::Error for TokenError {}

/// Parameters for [`crate::oidc::exchange_code`].
pub struct CodeExchangeParams<'a> {
    pub auth_domain: &'a str,
    pub client_id: &'a str,
    /// Leave `None` for public clients.
    pub client_secret: Option<&'a str>,
    pub redirect_uri: &'a str,
    pub code: &'a str,
    pub verifier: &'a str,
}

/// Parameters for [`crate::oidc::refresh_token`].
pub struct RefreshParams<'a> {
    pub auth_domain: &'a str,
    pub client_id: &'a str,
    /// Leave `None` for public clients.
    pub client_secret: Option<&'a str>,
    pub refresh_token: &'a str,
}

/// Response from the backend Device Authorization endpoint
/// (`POST /api/oauth/device/session`, SPIFFE-protected).
/// Pass the `device_code` and `interval` to [`crate::device::poll_until_done`].
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DeviceSessionResponse {
    pub device_code: String,
    /// Short code displayed to the user.
    pub user_code: String,
    /// URL the user visits to enter `user_code`.
    pub verification_url: String,
    /// URL with `user_code` pre-filled.
    pub verification_url_complete: String,
    pub expires_in: u64,
    /// Minimum poll interval in seconds.
    pub interval: u64,
}

/// Status variants for a single device token poll tick.
#[derive(Debug)]
pub enum DevicePollStatus {
    /// Still waiting for user authorization.
    Pending,
    /// Server requests slower polling; add `extra_seconds` to your interval.
    SlowDown { extra_seconds: u64 },
    /// User authorized — tokens are available.
    Authorized(TokenResponse),
    /// User denied the request.
    Denied,
    /// Device code has expired.
    Expired,
}

/// Result of a single call to [`crate::device::poll_device_token`].
pub type DevicePollResult = DevicePollStatus;

/// Parameters for [`crate::device::poll_device_token`] and [`crate::device::poll_until_done`].
pub struct DevicePollParams<'a> {
    /// Base URL of the backend proxy that calls `/api/oauth/device/token` with SPIFFE SVID.
    /// Do NOT point directly at `auth.binrc.com` from a desktop client
    /// unless the client holds a valid SPIFFE SVID.
    pub auth_domain: &'a str,
    pub client_id: &'a str,
    pub device_code: &'a str,
    /// Initial poll interval in seconds (from [`DeviceSessionResponse::interval`]).
    pub interval: u64,
}

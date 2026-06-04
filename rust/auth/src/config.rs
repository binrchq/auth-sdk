use async_trait::async_trait;
use std::time::Duration;

/// Pluggable storage backend for PKCE state.
/// Implement this trait over your Redis client.
#[async_trait]
pub trait RedisStore: Send + Sync + 'static {
    /// Store a key/value pair with a TTL.
    async fn set(&self, key: &str, value: &str, ttl: Duration) -> Result<(), String>;

    /// Atomically retrieve and delete a value. Returns `Ok(None)` if the key
    /// does not exist or has already expired.
    async fn get_del(&self, key: &str) -> Result<Option<String>, String>;
}

/// All configuration for the external (third-party) auth SDK.
#[derive(Clone)]
pub struct Config {
    /// Auth-service base URL. Default: `"https://auth.binrc.com"`.
    pub adapter_url: String,

    /// OAuth2 `client_id` registered in Hydra.
    pub client_id: String,

    /// Confidential client secret (required for token exchange).
    pub client_secret: String,

    /// AES-256 key for session-cookie encryption (≥ 32 bytes; shorter strings
    /// are zero-padded to 32, matching the Go auth-core behaviour).
    pub session_secret: String,

    /// Cookie `Domain` attribute, e.g. `".example.com"`.
    pub cookie_domain: String,

    /// App public origin used for CORS / `postMessage` target-origin.
    pub frontend_url: String,

    /// OAuth2 callback URL, e.g. `"https://app.example.com/auth/callback"`.
    /// Auto-derived from `frontend_url + "/auth/callback"` when empty.
    pub redirect_uri: String,

    /// PKCE state storage backend.
    pub redis_store: std::sync::Arc<dyn RedisStore>,

    /// Overrides the session-cookie name.
    /// The final cookie name is `"__Secure-" + session_cookie_name`.
    /// Default base: `"binrc-external-auth.session-token"`.
    pub session_cookie_name: String,

    /// Redis key prefix for PKCE state. Default: `"oauth:ext:"`.
    pub state_key_prefix: String,
}

impl Config {
    /// Build a `Config`, applying the same defaults as the Go SDK.
    pub fn new(
        adapter_url: impl Into<String>,
        client_id: impl Into<String>,
        client_secret: impl Into<String>,
        session_secret: impl Into<String>,
        cookie_domain: impl Into<String>,
        frontend_url: impl Into<String>,
        redirect_uri: impl Into<String>,
        redis_store: std::sync::Arc<dyn RedisStore>,
    ) -> Self {
        let adapter_url = {
            let s = adapter_url.into();
            if s.is_empty() {
                "https://auth.binrc.com".to_string()
            } else {
                s
            }
        };
        let frontend_url = frontend_url.into();
        let redirect_uri = {
            let r = redirect_uri.into();
            if r.is_empty() && !frontend_url.is_empty() {
                format!("{}/auth/callback", frontend_url.trim_end_matches('/'))
            } else {
                r
            }
        };
        Self {
            adapter_url,
            client_id: client_id.into(),
            client_secret: client_secret.into(),
            session_secret: session_secret.into(),
            cookie_domain: cookie_domain.into(),
            frontend_url,
            redirect_uri,
            redis_store,
            session_cookie_name: String::new(),
            state_key_prefix: String::new(),
        }
    }

    /// Returns the effective cookie name (with `__Secure-` prefix).
    pub(crate) fn cookie_name(&self) -> String {
        let base = if self.session_cookie_name.is_empty() {
            "binrc-external-auth.session-token"
        } else {
            &self.session_cookie_name
        };
        format!("__Secure-{}", base)
    }

    /// Returns the effective Redis state key for a given state token.
    pub(crate) fn state_key(&self, state: &str) -> String {
        let prefix = if self.state_key_prefix.is_empty() {
            "oauth:ext:"
        } else {
            &self.state_key_prefix
        };
        format!("{}{}", prefix, state)
    }
}

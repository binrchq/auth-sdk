use crate::{
    config::Config,
    session::{decrypt_session, encrypt_session, SessionPayload},
};
use axum::{
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Redirect, Response},
    Json,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::Rng;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::{collections::HashMap, sync::Arc, time::Duration};

/// Main SDK struct. Clone-cheap (wraps `Arc<Config>`).
#[derive(Clone)]
pub struct AuthSdk {
    cfg: Arc<Config>,
}

impl AuthSdk {
    /// Create a new SDK instance from config.
    pub fn new(config: Config) -> Self {
        Self {
            cfg: Arc::new(config),
        }
    }

    /// Returns the underlying config (useful for router State).
    pub fn config(&self) -> Arc<Config> {
        self.cfg.clone()
    }

    // ────────────────────────────────────────────────────────────────────
    // Handler implementations
    // ────────────────────────────────────────────────────────────────────

    /// GET /auth/login — generates PKCE + state + nonce, stores in Redis,
    /// redirects to adapter `/api/oauth/start`.
    pub async fn login_handler(
        State(cfg): State<Arc<Config>>,
        Query(params): Query<HashMap<String, String>>,
    ) -> Result<Redirect, ErrorResponse> {
        let (verifier, challenge) = generate_pkce();
        let state = random_base64(24);
        let nonce = random_base64(16);

        let return_to = safe_return_to(
            params.get("return_to").map(|s| s.as_str()).unwrap_or(""),
            &cfg.frontend_url,
        );

        let stashed = serde_json::json!({
            "verifier": verifier,
            "return_to": return_to,
            "nonce": nonce,
        });

        cfg.redis_store
            .set(
                &cfg.state_key(&state),
                &stashed.to_string(),
                Duration::from_secs(600), // 10 minutes
            )
            .await
            .map_err(|e| ErrorResponse::internal(&format!("redis_store_failed: {}", e)))?;

        let start_url = build_start_url(&cfg, &challenge, &state, &nonce);
        Ok(Redirect::to(&start_url))
    }

    /// GET/POST /auth/callback — exchanges code for tokens, writes session cookie.
    pub async fn callback_handler(
        State(cfg): State<Arc<Config>>,
        Query(params): Query<HashMap<String, String>>,
        _headers: HeaderMap,
    ) -> Result<Response, ErrorResponse> {
        // Handle OIDC error redirect
        if let Some(_err_code) = params.get("error") {
            let state = params.get("state").map(|s| s.as_str()).unwrap_or("");
            let mut return_to = "/".to_string();

            if !state.is_empty() {
                if let Ok(Some(raw)) = cfg.redis_store.get_del(&cfg.state_key(state)).await {
                    if let Ok(stashed) = serde_json::from_str::<serde_json::Value>(&raw) {
                        if let Some(rt) = stashed.get("return_to").and_then(|v| v.as_str()) {
                            return_to = rt.to_string();
                        }
                    }
                }
            }

            let sep = if return_to.contains('?') { "&" } else { "?" };
            return Ok(Redirect::to(&format!("{}{}login_required=1", return_to, sep)).into_response());
        }

        let code = params
            .get("code")
            .ok_or_else(|| ErrorResponse::bad_request("missing_code"))?;
        let state = params
            .get("state")
            .ok_or_else(|| ErrorResponse::bad_request("missing_state"))?;

        let raw = cfg
            .redis_store
            .get_del(&cfg.state_key(state))
            .await
            .map_err(|e| ErrorResponse::internal(&format!("redis_get_del_failed: {}", e)))?
            .ok_or_else(|| ErrorResponse::bad_request("state_not_found_or_expired"))?;

        let stashed: serde_json::Value = serde_json::from_str(&raw)
            .map_err(|_| ErrorResponse::bad_request("malformed_state_payload"))?;

        let verifier = stashed
            .get("verifier")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ErrorResponse::bad_request("missing_verifier"))?;
        let return_to = stashed
            .get("return_to")
            .and_then(|v| v.as_str())
            .unwrap_or("/");
        let nonce = stashed.get("nonce").and_then(|v| v.as_str()).unwrap_or("");

        // Exchange code for tokens
        let form = vec![
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", &cfg.redirect_uri),
            ("client_id", &cfg.client_id),
            ("code_verifier", verifier),
        ];

        let tokens = token_exchange(&cfg, &form)
            .await
            .map_err(|e| ErrorResponse::unauthorized(&format!("token_exchange_failed: {}", e)))?;

        // Validate nonce
        if !nonce.is_empty() {
            let id_nonce = extract_claim(&tokens.id_token, "nonce");
            if id_nonce.is_empty() || id_nonce != nonce {
                return Err(ErrorResponse::unauthorized("id_token_nonce_mismatch"));
            }
        }

        let sub = extract_claim(&tokens.id_token, "sub");
        let expires_in = if tokens.expires_in > 0 {
            tokens.expires_in
        } else {
            3600
        };

        let payload = SessionPayload {
            a: tokens.access_token,
            r: tokens.refresh_token,
            d: tokens.id_token,
            s: sub,
            x: chrono::Utc::now().timestamp() + expires_in,
        };

        let encrypted = encrypt_session(&payload, &cfg.session_secret)
            .map_err(|e| ErrorResponse::internal(&format!("encrypt_failed: {}", e)))?;

        let cookie_header = build_session_cookie(&cfg, &encrypted, expires_in as u64);
        let mut response = Redirect::to(return_to).into_response();
        response
            .headers_mut()
            .insert(header::SET_COOKIE, cookie_header.parse().unwrap());

        Ok(response)
    }

    /// POST /auth/refresh — rotates tokens using the stored refresh token.
    pub async fn refresh_handler(
        State(cfg): State<Arc<Config>>,
        headers: HeaderMap,
    ) -> Result<Json<serde_json::Value>, ErrorResponse> {
        let session_cookie = extract_cookie(&headers, &cfg.cookie_name())
            .ok_or_else(|| ErrorResponse::unauthorized("no_session"))?;

        let p = decrypt_session(&session_cookie, &cfg.session_secret)
            .map_err(|_| ErrorResponse::unauthorized("invalid_session"))?;

        if p.r.is_empty() {
            return Err(ErrorResponse::unauthorized("fedcm_refresh_required"));
        }

        let form = vec![
            ("grant_type", "refresh_token"),
            ("refresh_token", p.r.as_str()),
            ("client_id", cfg.client_id.as_str()),
        ];

        let tokens = token_exchange(&cfg, &form).await.map_err(|_| {
            // On refresh failure we should also clear the cookie, but since we return
            // an error response the middleware can handle that; the client should
            // redirect to login.
            ErrorResponse::unauthorized("refresh_failed")
        })?;

        let expires_in = if tokens.expires_in > 0 {
            tokens.expires_in
        } else {
            3600
        };

        let new_payload = SessionPayload {
            a: tokens.access_token,
            r: tokens.refresh_token,
            d: tokens.id_token,
            s: p.s,
            x: chrono::Utc::now().timestamp() + expires_in,
        };

        let encrypted = encrypt_session(&new_payload, &cfg.session_secret)
            .map_err(|e| ErrorResponse::internal(&format!("encrypt_failed: {}", e)))?;

        let _cookie_header = build_session_cookie(&cfg, &encrypted, expires_in as u64);

        // Return JSON with Set-Cookie header
        Ok(Json(serde_json::json!({ "ok": true })))
    }

    /// POST /auth/logout — clears the session cookie.
    pub async fn logout_handler(
        State(cfg): State<Arc<Config>>,
    ) -> impl IntoResponse {
        let clear_cookie = clear_session_cookie(&cfg);
        (
            [(header::SET_COOKIE, clear_cookie)],
            Json(serde_json::json!({ "ok": true })),
        )
    }

    /// POST /auth/fedcm-exchange — exchanges a FedCM ID token for a session.
    pub async fn fedcm_exchange_handler(
        State(cfg): State<Arc<Config>>,
        Json(body): Json<FedcmExchangeRequest>,
    ) -> Result<impl IntoResponse, ErrorResponse> {
        if body.id_token.is_empty() {
            return Err(ErrorResponse::bad_request("missing_id_token"));
        }

        let form = vec![
            ("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange"),
            ("subject_token", body.id_token.as_str()),
            ("subject_token_type", "urn:ietf:params:oauth:token-type:id_token"),
            ("client_id", cfg.client_id.as_str()),
        ];

        let tokens = token_exchange(&cfg, &form)
            .await
            .map_err(|e| ErrorResponse::with_detail(StatusCode::UNAUTHORIZED, "fedcm_exchange_failed", &e))?;

        let sub = if tokens.sub.is_empty() {
            extract_claim(&tokens.id_token, "sub")
        } else {
            tokens.sub.clone()
        };

        let expires_in = if tokens.expires_in > 0 {
            tokens.expires_in
        } else {
            3600
        };

        let payload = SessionPayload {
            a: tokens.access_token,
            r: tokens.refresh_token,
            d: tokens.id_token,
            s: sub,
            x: chrono::Utc::now().timestamp() + expires_in,
        };

        let encrypted = encrypt_session(&payload, &cfg.session_secret)
            .map_err(|e| ErrorResponse::internal(&format!("encrypt_failed: {}", e)))?;

        let cookie_header = build_session_cookie(&cfg, &encrypted, expires_in as u64);
        Ok((
            [(header::SET_COOKIE, cookie_header)],
            Json(serde_json::json!({ "ok": true })),
        ))
    }

    /// GET /auth/me — returns identity claims from the session cookie.
    /// Requires the session middleware to have injected `SessionPayload` into extensions.
    pub async fn me_handler(
        axum::extract::Extension(payload): axum::extract::Extension<Arc<SessionPayload>>,
    ) -> Json<serde_json::Value> {
        let sub = payload.s.clone();

        if payload.d.is_empty() {
            return Json(serde_json::json!({ "id": sub }));
        }

        let claims = extract_all_claims(&payload.d);
        match claims {
            None => Json(serde_json::json!({ "id": sub })),
            Some(all) => {
                let mut traits: serde_json::Map<String, serde_json::Value> =
                    serde_json::Map::new();
                for key in ["email", "name", "phone", "email_verified"] {
                    if let Some(val) = all.get(key) {
                        traits.insert(key.to_string(), val.clone());
                    }
                }
                Json(serde_json::json!({ "id": sub, "traits": traits }))
            }
        }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Request / response types
// ────────────────────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct FedcmExchangeRequest {
    pub id_token: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    #[serde(default)]
    access_token: String,
    #[serde(default)]
    refresh_token: String,
    #[serde(default)]
    id_token: String,
    #[serde(default)]
    expires_in: i64,
    #[serde(default)]
    sub: String,
}

// ────────────────────────────────────────────────────────────────────────────
// Error response helper
// ────────────────────────────────────────────────────────────────────────────

pub struct ErrorResponse {
    pub status: StatusCode,
    pub body: serde_json::Value,
}

impl ErrorResponse {
    pub fn bad_request(code: &str) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            body: serde_json::json!({ "error": code }),
        }
    }

    pub fn unauthorized(code: &str) -> Self {
        Self {
            status: StatusCode::UNAUTHORIZED,
            body: serde_json::json!({ "error": code }),
        }
    }

    pub fn internal(code: &str) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            body: serde_json::json!({ "error": code }),
        }
    }

    pub fn with_detail(status: StatusCode, code: &str, detail: &str) -> Self {
        Self {
            status,
            body: serde_json::json!({ "error": code, "detail": detail }),
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        (self.status, Json(self.body)).into_response()
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────

/// Issue a POST request to `<adapter_url>/api/oauth/token`.
async fn token_exchange(cfg: &Config, form: &[(&str, &str)]) -> Result<TokenResponse, String> {
    let body: String = form
        .iter()
        .map(|(k, v)| {
            format!(
                "{}={}",
                urlencoding_encode(k),
                urlencoding_encode(v)
            )
        })
        .collect::<Vec<_>>()
        .join("&");

    let url = format!("{}/api/oauth/token", cfg.adapter_url);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let mut req = client
        .post(&url)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body);

    if !cfg.client_secret.is_empty() {
        req = req.basic_auth(&cfg.client_id, Some(&cfg.client_secret));
    }

    let resp = req.send().await.map_err(|e| e.to_string())?;

    if resp.status() != reqwest::StatusCode::OK {
        return Err(format!("token endpoint returned {}", resp.status()));
    }

    resp.json::<TokenResponse>()
        .await
        .map_err(|e| format!("failed to decode token response: {}", e))
}

/// Minimal percent-encoding for form values.
fn urlencoding_encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9'
            | b'-' | b'_' | b'.' | b'~' => out.push(b as char),
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

/// Generate a PKCE verifier + S256 challenge.
fn generate_pkce() -> (String, String) {
    let mut raw = [0u8; 32];
    rand::thread_rng().fill(&mut raw);
    let verifier = URL_SAFE_NO_PAD.encode(raw);
    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    let hash = hasher.finalize();
    let challenge = URL_SAFE_NO_PAD.encode(hash);
    (verifier, challenge)
}

/// Generate `n` random bytes encoded as Base64-URL-NoPad.
fn random_base64(n: usize) -> String {
    let mut buf = vec![0u8; n];
    rand::thread_rng().fill(buf.as_mut_slice());
    URL_SAFE_NO_PAD.encode(&buf)
}

/// Build the adapter `/api/oauth/start` URL with all required parameters.
fn build_start_url(cfg: &Config, challenge: &str, state: &str, nonce: &str) -> String {
    let params = [
        ("app", cfg.client_id.as_str()),
        ("code_challenge", challenge),
        ("code_challenge_method", "S256"),
        ("state", state),
        ("nonce", nonce),
        ("response_mode", "form_post"),
        ("redirect_uri", &cfg.redirect_uri),
        ("scope", "openid offline_access"),
    ];

    let query: String = params
        .iter()
        .map(|(k, v)| format!("{}={}", urlencoding_encode(k), urlencoding_encode(v)))
        .collect::<Vec<_>>()
        .join("&");

    format!("{}/api/oauth/start?{}", cfg.adapter_url, query)
}

/// Build a `Set-Cookie` header value for the session cookie.
fn build_session_cookie(cfg: &Config, value: &str, max_age: u64) -> String {
    let mut parts = vec![
        format!("{}={}", cfg.cookie_name(), value),
        "Path=/".to_string(),
        format!("Max-Age={}", max_age),
        "HttpOnly".to_string(),
        "Secure".to_string(),
        "SameSite=Lax".to_string(),
    ];
    if !cfg.cookie_domain.is_empty() {
        parts.push(format!("Domain={}", cfg.cookie_domain));
    }
    parts.join("; ")
}

/// Build a `Set-Cookie` header value that clears the session cookie.
fn clear_session_cookie(cfg: &Config) -> String {
    let mut parts = vec![
        format!("{}=", cfg.cookie_name()),
        "Path=/".to_string(),
        "Max-Age=-1".to_string(),
        "HttpOnly".to_string(),
        "Secure".to_string(),
        "SameSite=Lax".to_string(),
    ];
    if !cfg.cookie_domain.is_empty() {
        parts.push(format!("Domain={}", cfg.cookie_domain));
    }
    parts.join("; ")
}

/// Extract a cookie value by name from request headers.
pub(crate) fn extract_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
    for val in headers.get_all(header::COOKIE) {
        if let Ok(s) = val.to_str() {
            for pair in s.split(';') {
                let pair = pair.trim();
                if let Some((k, v)) = pair.split_once('=') {
                    if k.trim() == name {
                        return Some(v.trim().to_string());
                    }
                }
            }
        }
    }
    None
}

/// Extract a single JWT claim value as a string.
fn extract_claim(id_token: &str, claim: &str) -> String {
    extract_all_claims(id_token)
        .and_then(|m| m.get(claim).and_then(|v| v.as_str()).map(str::to_string))
        .unwrap_or_default()
}

/// Decode the payload section of a JWT and return all claims.
fn extract_all_claims(id_token: &str) -> Option<serde_json::Map<String, serde_json::Value>> {
    let parts: Vec<&str> = id_token.splitn(3, '.').collect();
    if parts.len() < 2 {
        return None;
    }
    let payload = URL_SAFE_NO_PAD.decode(parts[1]).ok()?;
    serde_json::from_slice::<serde_json::Map<String, serde_json::Value>>(&payload).ok()
}

/// Validate `return_to` against the configured `frontend_url` to prevent open-redirect.
/// Matches the Go `safeReturnTo` function exactly.
pub(crate) fn safe_return_to(raw: &str, frontend_url: &str) -> String {
    if raw.is_empty() {
        return "/".to_string();
    }
    // Reject common bypass patterns
    if raw.starts_with("/\\") || raw.starts_with("/ ") || raw.starts_with("/\t") {
        return "/".to_string();
    }
    if raw.starts_with('/') && !raw.starts_with("//") {
        return raw.to_string();
    }
    // Full URL — must be https and same host as frontend_url
    if !raw.starts_with("https://") {
        return "/".to_string();
    }
    if frontend_url.is_empty() {
        return "/".to_string();
    }
    let raw_host = extract_host(raw);
    let frontend_host = extract_host(frontend_url);
    if raw_host.is_empty() || raw_host != frontend_host {
        return "/".to_string();
    }
    raw.to_string()
}

fn extract_host(url: &str) -> String {
    // Simple extraction: strip scheme, take up to first '/'
    let after_scheme = if let Some(pos) = url.find("://") {
        &url[pos + 3..]
    } else {
        url
    };
    after_scheme
        .split('/')
        .next()
        .unwrap_or("")
        .to_string()
}

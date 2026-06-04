use crate::{
    config::Config,
    handlers::extract_cookie,
    session::decrypt_session,
};
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Json, Response},
};
use std::sync::Arc;

/// Axum middleware that validates the session cookie and injects the session
/// subject and full payload into request extensions.
///
/// On success the following types are available via `Extension`:
///   - `Arc<SessionPayload>` — the full decrypted session payload.
///   - `String` (subject) — convenience alias for `payload.s`.
///
/// On failure the middleware short-circuits and returns a JSON 401.
///
/// # Usage
///
/// ```rust
/// use axum::{Router, middleware};
/// use binrc_auth::{AuthSdk, Config};
/// use binrc_auth::middleware::require_session;
///
/// let sdk = AuthSdk::new(config);
///
/// let protected = Router::new()
///     .route("/api/me", axum::routing::get(handler))
///     .route_layer(middleware::from_fn_with_state(
///         sdk.config(),
///         require_session,
///     ));
/// ```
pub async fn require_session(
    State(cfg): State<Arc<Config>>,
    mut request: Request,
    next: Next,
) -> Result<Response, SessionMiddlewareError> {
    let headers = request.headers();
    let cookie_value = extract_cookie(headers, &cfg.cookie_name())
        .ok_or(SessionMiddlewareError::NoSession)?;

    let payload = decrypt_session(&cookie_value, &cfg.session_secret)
        .map_err(|_| SessionMiddlewareError::InvalidSession)?;

    // Check expiry
    if payload.x > 0 && chrono::Utc::now().timestamp() > payload.x {
        return Err(SessionMiddlewareError::Expired);
    }

    // Inject subject string (cheap clone)
    let subject: String = payload.s.clone();
    let payload_arc = Arc::new(payload);

    request.extensions_mut().insert(payload_arc);
    request.extensions_mut().insert(subject);

    Ok(next.run(request).await)
}

// ────────────────────────────────────────────────────────────────────────────

/// Errors that the session middleware can produce.
#[derive(Debug)]
pub enum SessionMiddlewareError {
    NoSession,
    InvalidSession,
    Expired,
}

impl IntoResponse for SessionMiddlewareError {
    fn into_response(self) -> Response {
        let (status, code) = match self {
            SessionMiddlewareError::NoSession => (StatusCode::UNAUTHORIZED, "no_session"),
            SessionMiddlewareError::InvalidSession => (StatusCode::UNAUTHORIZED, "invalid_session"),
            SessionMiddlewareError::Expired => (StatusCode::UNAUTHORIZED, "session_expired"),
        };
        (status, Json(serde_json::json!({ "error": code }))).into_response()
    }
}

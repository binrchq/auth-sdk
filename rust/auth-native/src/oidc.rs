use reqwest::Client;
use serde::Deserialize;
use url::Url;
use crate::error::AuthError;
use crate::types::{AuthUrlParams, CodeExchangeParams, RefreshParams, TokenResponse};

/// Build the OIDC authorization URL pointing to `/api/oauth/auth`.
/// Open this URL in a `WebviewWindow` or system browser.
pub fn build_auth_url(p: &AuthUrlParams<'_>) -> Result<String, AuthError> {
    let mut url = Url::parse(p.auth_domain)?;
    url.set_path("/api/oauth/auth");
    let scope = p.scope.unwrap_or("openid email profile offline_access");
    url.query_pairs_mut()
        .append_pair("client_id", p.client_id)
        .append_pair("response_type", "code")
        .append_pair("response_mode", "query")
        .append_pair("code_challenge", p.challenge)
        .append_pair("code_challenge_method", "S256")
        .append_pair("state", p.state)
        .append_pair("nonce", p.nonce)
        .append_pair("redirect_uri", p.redirect_uri)
        .append_pair("scope", scope);
    Ok(url.to_string())
}

#[derive(Deserialize)]
struct TokenErrorBody {
    error: Option<String>,
    error_description: Option<String>,
}

/// Exchange an authorization code for tokens via `/api/oauth/token`.
pub async fn exchange_code(p: &CodeExchangeParams<'_>) -> Result<TokenResponse, AuthError> {
    exchange_code_with_client(p, &Client::new()).await
}

/// Like [`exchange_code`] but uses a provided [`reqwest::Client`].
pub async fn exchange_code_with_client(p: &CodeExchangeParams<'_>, client: &Client) -> Result<TokenResponse, AuthError> {
    let params = [
        ("grant_type", "authorization_code"),
        ("code", p.code),
        ("code_verifier", p.verifier),
        ("redirect_uri", p.redirect_uri),
        ("client_id", p.client_id),
    ];
    do_token_request(p.auth_domain, p.client_id, p.client_secret, &params, client).await
}

/// Refresh an access token via `/api/oauth/token`.
pub async fn refresh_token(p: &RefreshParams<'_>) -> Result<TokenResponse, AuthError> {
    refresh_token_with_client(p, &Client::new()).await
}

/// Like [`refresh_token`] but uses a provided [`reqwest::Client`].
pub async fn refresh_token_with_client(p: &RefreshParams<'_>, client: &Client) -> Result<TokenResponse, AuthError> {
    let params = [
        ("grant_type", "refresh_token"),
        ("refresh_token", p.refresh_token),
        ("client_id", p.client_id),
    ];
    do_token_request(p.auth_domain, p.client_id, p.client_secret, &params, client).await
}

/// Revoke a token via `/api/oauth/revoke`.
pub async fn revoke_token(
    auth_domain: &str,
    client_id: &str,
    client_secret: Option<&str>,
    token: &str,
) -> Result<(), AuthError> {
    let endpoint = format!("{}/api/oauth/revoke", auth_domain.trim_end_matches('/'));
    let mut req = Client::new()
        .post(&endpoint)
        .form(&[("token", token), ("client_id", client_id)]);
    if let Some(secret) = client_secret {
        req = req.basic_auth(client_id, Some(secret));
    }
    req.send().await?;
    Ok(())
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async fn do_token_request(
    auth_domain: &str,
    client_id: &str,
    client_secret: Option<&str>,
    params: &[(&str, &str)],
    http: &Client,
) -> Result<TokenResponse, AuthError> {
    let endpoint = format!("{}/api/oauth/token", auth_domain.trim_end_matches('/'));
    let mut req = http.post(&endpoint).form(params);
    if let Some(secret) = client_secret {
        req = req.basic_auth(client_id, Some(secret));
    }
    let resp = req.send().await?;
    let status = resp.status();
    let body = resp.text().await?;
    if status.is_success() {
        Ok(serde_json::from_str::<TokenResponse>(&body)
            .map_err(|e| AuthError::Token { status: status.as_u16(), code: "decode_error".into(), description: e.to_string() })?)
    } else {
        let err: TokenErrorBody = serde_json::from_str(&body).unwrap_or(TokenErrorBody { error: None, error_description: None });
        Err(AuthError::Token {
            status: status.as_u16(),
            code: err.error.unwrap_or_else(|| "unknown".into()),
            description: err.error_description.unwrap_or_default(),
        })
    }
}

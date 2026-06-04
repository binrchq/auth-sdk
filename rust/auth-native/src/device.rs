use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::time::{sleep, Duration};
use crate::error::AuthError;
use crate::types::{DevicePollParams, DevicePollResult, TokenResponse};

#[derive(Deserialize, Serialize)]
struct DevicePollRequest<'a> {
    device_code: &'a str,
    grant_type: &'static str,
    client_id: &'a str,
}

#[derive(Deserialize)]
struct ErrorBody {
    error: Option<String>,
}

/// Perform a single device token poll tick.
pub async fn poll_device_token(p: &DevicePollParams<'_>) -> Result<DevicePollResult, AuthError> {
    poll_device_token_with_client(p, &Client::new()).await
}

/// Like [`poll_device_token`] but uses a provided [`reqwest::Client`].
pub async fn poll_device_token_with_client(p: &DevicePollParams<'_>, client: &Client) -> Result<DevicePollResult, AuthError> {
    let endpoint = format!("{}/api/oauth/device/token", p.auth_domain.trim_end_matches('/'));
    let body = DevicePollRequest {
        device_code: p.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: p.client_id,
    };
    let resp = client.post(&endpoint).json(&body).send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if status.as_u16() == 200 {
        let tokens = serde_json::from_str::<TokenResponse>(&text)
            .map_err(|e| AuthError::Token { status: 200, code: "decode_error".into(), description: e.to_string() })?;
        return Ok(DevicePollResult::Authorized(tokens));
    }

    let err: ErrorBody = serde_json::from_str(&text).unwrap_or(ErrorBody { error: None });
    let code = err.error.as_deref().unwrap_or("");

    match (status.as_u16(), code) {
        (428, _) | (_, "authorization_pending") => Ok(DevicePollResult::Pending),
        (403, "slow_down") => Ok(DevicePollResult::SlowDown { extra_seconds: 5 }),
        (403, "access_denied") => Ok(DevicePollResult::Denied),
        (400, "expired_token") => Ok(DevicePollResult::Expired),
        _ => Err(AuthError::Token {
            status: status.as_u16(),
            code: code.to_string(),
            description: String::new(),
        }),
    }
}

/// Poll until authorized, denied, expired, or cancelled.
///
/// `on_pending` is called on each `authorization_pending` tick.
/// Pass a `tokio_util::sync::CancellationToken` by wrapping your logic in a select!.
pub async fn poll_until_done<F>(
    p: &DevicePollParams<'_>,
    on_pending: F,
) -> Result<TokenResponse, AuthError>
where
    F: FnMut(),
{
    poll_until_done_with_client(p, &Client::new(), on_pending).await
}

/// Like [`poll_until_done`] but uses a provided [`reqwest::Client`].
pub async fn poll_until_done_with_client<F>(
    p: &DevicePollParams<'_>,
    client: &Client,
    mut on_pending: F,
) -> Result<TokenResponse, AuthError>
where
    F: FnMut(),
{
    let mut interval = if p.interval == 0 { 5 } else { p.interval };
    loop {
        sleep(Duration::from_secs(interval)).await;
        match poll_device_token_with_client(p, client).await? {
            DevicePollResult::Authorized(tokens) => return Ok(tokens),
            DevicePollResult::Denied => return Err(AuthError::DeviceDenied),
            DevicePollResult::Expired => return Err(AuthError::DeviceExpired),
            DevicePollResult::SlowDown { extra_seconds } => interval += extra_seconds,
            DevicePollResult::Pending => on_pending(),
        }
    }
}

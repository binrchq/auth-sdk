use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Token error {code} ({status}): {description}")]
    Token { status: u16, code: String, description: String },

    #[error("Device authorization denied by user")]
    DeviceDenied,

    #[error("Device code expired")]
    DeviceExpired,

    #[error("Invalid URL: {0}")]
    InvalidUrl(#[from] url::ParseError),

    #[error("Poll cancelled")]
    Cancelled,
}

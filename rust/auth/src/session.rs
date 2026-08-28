//! Session payload and AES-256-GCM encrypt/decrypt helpers.
//! Delegates to binrc-auth-core for the actual crypto primitives,
//! ensuring byte-for-byte compatibility with the Go auth-core and all other SDKs.

use std::time::{SystemTime, UNIX_EPOCH};
use binrc_auth_core::{decrypt_aes_gcm, encrypt_aes_gcm, AuthError};
pub use binrc_auth_core::SessionPayload;

/// Encrypt a `SessionPayload` to a base64url string using AES-256-GCM.
pub fn encrypt_session(payload: &SessionPayload, secret: &str) -> Result<String, AuthError> {
    let plaintext = serde_json::to_vec(payload)?;
    encrypt_aes_gcm(&plaintext, secret)
}

/// Decrypt a base64url AES-256-GCM ciphertext and deserialize the `SessionPayload`.
/// Returns `AuthError::SessionExpired` when `payload.exp > 0` and the expiry has passed.
pub fn decrypt_session(encrypted: &str, secret: &str) -> Result<SessionPayload, AuthError> {
    let plaintext = decrypt_aes_gcm(encrypted, secret)?;
    let p: SessionPayload = serde_json::from_slice(&plaintext)?;
    if p.exp > 0 && now_unix() > p.exp {
        return Err(AuthError::SessionExpired);
    }
    Ok(p)
}

/// Decrypt without enforcing the expiry timestamp — used by refresh flows.
pub fn decrypt_session_ignore_expiry(encrypted: &str, secret: &str) -> Result<SessionPayload, AuthError> {
    let plaintext = decrypt_aes_gcm(encrypted, secret)?;
    Ok(serde_json::from_slice(&plaintext)?)
}

pub(crate) fn now_unix() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

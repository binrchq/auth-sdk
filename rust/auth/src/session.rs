//! Session payload and AES-256-GCM encrypt/decrypt helpers.

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Encryption failed: {0}")]
    EncryptionError(String),
    #[error("Decryption failed: {0}")]
    DecryptionError(String),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Base64 error: {0}")]
    Base64Error(#[from] base64::DecodeError),
    #[error("Session expired")]
    SessionExpired,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

/// Standard OAuth2 / OIDC session payload for third-party application backends.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionPayload {
    #[serde(rename = "access_token")]
    pub access_token: String,
    #[serde(rename = "refresh_token", default)]
    pub refresh_token: String,
    #[serde(rename = "id_token", default)]
    pub id_token: String,
    #[serde(rename = "sub")]
    pub sub: String,
    #[serde(rename = "exp")]
    pub exp: i64,
}

/// Encrypt a `SessionPayload` to a base64url string using standard AES-256-GCM.
pub fn encrypt_session(payload: &SessionPayload, secret: &str) -> Result<String, AuthError> {
    let plaintext = serde_json::to_vec(payload)?;
    encrypt_aes_gcm(&plaintext, secret)
}

/// Decrypt a base64url AES-256-GCM ciphertext and deserialize the `SessionPayload`.
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

pub fn encrypt_aes_gcm(plaintext: &[u8], secret: &str) -> Result<String, AuthError> {
    let mut key_bytes = [0u8; 32];
    let secret_bytes = secret.as_bytes();
    let len = std::cmp::min(secret_bytes.len(), 32);
    key_bytes[..len].copy_from_slice(&secret_bytes[..len]);

    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AuthError::EncryptionError(e.to_string()))?;
    
    let nonce_bytes = rand::random::<[u8; 12]>();
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext)
        .map_err(|e| AuthError::EncryptionError(e.to_string()))?;

    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(URL_SAFE_NO_PAD.encode(&combined))
}

pub fn decrypt_aes_gcm(encrypted: &str, secret: &str) -> Result<Vec<u8>, AuthError> {
    let data = URL_SAFE_NO_PAD.decode(encrypted)
        .map_err(AuthError::Base64Error)?;

    if data.len() < 12 {
        return Err(AuthError::InvalidInput("Ciphertext too short".to_string()));
    }

    let nonce_bytes = &data[..12];
    let ciphertext = &data[12..];

    let mut key_bytes = [0u8; 32];
    let secret_bytes = secret.as_bytes();
    let len = std::cmp::min(secret_bytes.len(), 32);
    key_bytes[..len].copy_from_slice(&secret_bytes[..len]);

    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AuthError::DecryptionError(e.to_string()))?;
    
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher.decrypt(nonce, ciphertext)
        .map_err(|e| AuthError::DecryptionError(e.to_string()))
}

pub(crate) fn now_unix() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

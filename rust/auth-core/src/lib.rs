use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use serde::{Deserialize, Serialize};
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionPayload {
    pub a: String,
    pub r: String,
    pub d: String,
    pub s: String,
    pub x: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UserInfo {
    pub sub: String,
    #[serde(skip_serializing_if = "String::is_empty", default)]
    pub name: String,
    #[serde(skip_serializing_if = "String::is_empty", default)]
    pub email: String,
    #[serde(skip_serializing_if = "String::is_empty", default)]
    pub phone: String,
    #[serde(skip_serializing_if = "String::is_empty", default)]
    pub avatar: String,
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

    let mut result = nonce_bytes.to_vec();
    result.extend_from_slice(&ciphertext);

    Ok(URL_SAFE_NO_PAD.encode(result))
}

pub fn decrypt_aes_gcm(encrypted: &str, secret: &str) -> Result<Vec<u8>, AuthError> {
    let data = URL_SAFE_NO_PAD.decode(encrypted)?;
    
    if data.len() < 12 {
        return Err(AuthError::InvalidInput("Ciphertext too short".into()));
    }

    let mut key_bytes = [0u8; 32];
    let secret_bytes = secret.as_bytes();
    let len = std::cmp::min(secret_bytes.len(), 32);
    key_bytes[..len].copy_from_slice(&secret_bytes[..len]);

    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AuthError::DecryptionError(e.to_string()))?;
    
    let (nonce_bytes, ciphertext) = data.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|e| AuthError::DecryptionError(e.to_string()))?;

    Ok(plaintext)
}

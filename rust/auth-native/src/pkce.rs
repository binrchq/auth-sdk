use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;
use sha2::{Digest, Sha256};
use crate::types::PkceParams;

/// Generate a cryptographically random PKCE verifier and its S256 challenge.
pub fn generate_pkce() -> PkceParams {
    let verifier = random_base64url(32);
    let digest = Sha256::digest(verifier.as_bytes());
    let challenge = URL_SAFE_NO_PAD.encode(digest);
    PkceParams { verifier, challenge, method: "S256" }
}

/// Generate `n` random bytes encoded as base64url (no padding).
pub fn random_base64url(n: usize) -> String {
    let mut bytes = vec![0u8; n];
    rand::thread_rng().fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(&bytes)
}

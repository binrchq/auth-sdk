package core

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
)

type SessionPayload struct {
	A string `json:"a"`
	R string `json:"r"`
	D string `json:"d"`
	S string `json:"s"`
	X int64  `json:"x"`
}

type UserInfo struct {
	Sub    string `json:"sub"`
	Name   string `json:"name,omitempty"`
	Email  string `json:"email,omitempty"`
	Phone  string `json:"phone,omitempty"`
	Avatar string `json:"avatar,omitempty"`
}

// EncryptAesGcm encrypts plaintext using AES-256-GCM
func EncryptAesGcm(plaintext []byte, secret string) (string, error) {
	key := make([]byte, 32)
	copy(key, []byte(secret))

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.RawURLEncoding.EncodeToString(ciphertext), nil
}

// DecryptAesGcm decrypts ciphertext using AES-256-GCM and checks TTL
func DecryptAesGcm(encrypted string, secret string, ttlMs int64) ([]byte, error) {
	key := make([]byte, 32)
	copy(key, []byte(secret))

	data, err := base64.RawURLEncoding.DecodeString(encrypted)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

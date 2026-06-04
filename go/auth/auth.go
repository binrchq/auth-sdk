package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	core "binrc.com/auth-sdk/go/auth-core"
	"github.com/gin-gonic/gin"
)

// RedisStore is a pluggable storage interface for PKCE verifiers.
type RedisStore interface {
	Set(ctx context.Context, key string, value string, ttl time.Duration) error
	GetDel(ctx context.Context, key string) (string, error)
}

// Config holds all configuration for the external (third-party) auth SDK.
type Config struct {
	// AdapterURL is the auth service base URL (default: "https://auth.binrc.com").
	AdapterURL string
	// ClientID is the OAuth2 client_id registered in Hydra.
	ClientID string
	// ClientSecret is the confidential client secret (required for token exchange).
	ClientSecret string
	// SessionSecret is the AES-256 key for session cookie encryption (≥32 bytes).
	SessionSecret string
	// CookieDomain is the domain for the session cookie (e.g. ".example.com").
	CookieDomain string
	// FrontendURL is the app's public origin, used for CORS and postMessage targetOrigin.
	FrontendURL string
	// RedirectURI is the OAuth2 callback URL (e.g. "https://app.example.com/auth/callback").
	RedirectURI string
	// RedisStore is the PKCE state storage backend.
	RedisStore RedisStore
	// SessionCookieName overrides the session cookie name.
	// Default: "app-session" (production: "__Secure-app-session").
	// Set this to something meaningful for your app, e.g. "myapp-session".
	// Do NOT use names that expose the underlying auth platform.
	SessionCookieName string
	// StateKeyPrefix is the Redis key prefix for PKCE state storage.
	// Default: "oauth:state:" — override if you need to namespace by app.
	StateKeyPrefix string
	// HTTPClient is an optional custom HTTP client to use for backend calls.
	// If nil, falls back to a default client with a 10-second timeout.
	HTTPClient *http.Client
}

// SDK is the external (third-party) auth SDK instance.
type SDK struct {
	cfg Config
}

// New creates a new SDK instance.
func New(config Config) *SDK {
	if config.AdapterURL == "" {
		config.AdapterURL = "https://auth.binrc.com"
	}
	// Auto-derive redirect_uri from FrontendURL if not explicitly set.
	if config.RedirectURI == "" && config.FrontendURL != "" {
		config.RedirectURI = strings.TrimRight(config.FrontendURL, "/") + "/auth/callback"
	}
	return &SDK{cfg: config}
}

var defaultHTTPClient = &http.Client{
	Timeout: 10 * time.Second,
}

func (s *SDK) httpClient() *http.Client {
	if s.cfg.HTTPClient != nil {
		return s.cfg.HTTPClient
	}
	return defaultHTTPClient
}

// ─── Session Encryption ──────────────────────────────────────────────────────

type sessionPayload struct {
	A string `json:"a"`
	R string `json:"r"`
	D string `json:"d"`
	S string `json:"s"`
	X int64  `json:"x"`
}

func (s *SDK) encryptSession(p sessionPayload) (string, error) {
	plaintext, _ := json.Marshal(p)
	return core.EncryptAesGcm(plaintext, s.cfg.SessionSecret)
}

func (s *SDK) decryptSession(encrypted string) (*sessionPayload, error) {
	plaintext, err := core.DecryptAesGcm(encrypted, s.cfg.SessionSecret, 0)
	if err != nil {
		return nil, err
	}
	var p sessionPayload
	if err := json.Unmarshal(plaintext, &p); err != nil {
		return nil, err
	}
	return &p, nil
}

// ─── Handlers ────────────────────────────────────────────────────────────────

// LoginHandler handles GET /auth/login.
// Generates PKCE + state + nonce, stores them in Redis, then 302 redirects to Adapter /api/oauth/start.
func (s *SDK) LoginHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		verifier, challenge, err := generatePKCE()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "pkce_generation_failed"})
			return
		}

		state, err := randomBase64(24)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "state_generation_failed"})
			return
		}

		nonce, err := randomBase64(16)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "nonce_generation_failed"})
			return
		}

		returnTo := safeReturnTo(c.Query("return_to"), s.cfg.FrontendURL)

		stashed := map[string]string{
			"verifier":  verifier,
			"return_to": returnTo,
			"nonce":     nonce,
		}
		stashedJSON, _ := json.Marshal(stashed)
		if err := s.cfg.RedisStore.Set(c.Request.Context(), s.stateKey(state), string(stashedJSON), 10*time.Minute); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "redis_store_failed"})
			return
		}

		c.Redirect(http.StatusFound, s.buildStartURL(challenge, state, nonce))
	}
}

// CallbackHandler handles GET/POST /auth/callback.
// POST: form_post from Hydra with code+state.
// GET: error redirect from Hydra (e.g. consent_required, login_required).
func (s *SDK) CallbackHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Handle OIDC error redirect (GET ?error=... or POST error=...)
		errCode := c.Request.FormValue("error")
		if errCode != "" {
			state := c.Request.FormValue("state")
			returnTo := "/"
			if state != "" {
				if raw, _ := s.cfg.RedisStore.GetDel(c.Request.Context(), s.stateKey(state)); raw != "" {
					var stashed struct{ ReturnTo string `json:"return_to"` }
					json.Unmarshal([]byte(raw), &stashed)
					if stashed.ReturnTo != "" {
						returnTo = stashed.ReturnTo
					}
				}
			}
			sep := "?"
			if strings.Contains(returnTo, "?") {
				sep = "&"
			}
			c.Redirect(http.StatusFound, returnTo+sep+"login_required=1")
			return
		}

		code := c.Request.FormValue("code")
		state := c.Request.FormValue("state")
		if code == "" || state == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing_code_or_state"})
			return
		}

		raw, err := s.cfg.RedisStore.GetDel(c.Request.Context(), s.stateKey(state))
		if err != nil || raw == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "state_not_found_or_expired"})
			return
		}

		var stashed struct {
			Verifier string `json:"verifier"`
			ReturnTo string `json:"return_to"`
			Nonce    string `json:"nonce"`
		}
		json.Unmarshal([]byte(raw), &stashed)

		form := url.Values{}
		form.Set("grant_type", "authorization_code")
		form.Set("code", code)
		form.Set("redirect_uri", s.cfg.RedirectURI)
		form.Set("client_id", s.cfg.ClientID)
		form.Set("code_verifier", stashed.Verifier)

		tokens, err := s.tokenExchange(c.Request.Context(), form)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token_exchange_failed"})
			return
		}

		// Validate nonce in id_token to prevent replay attacks
		if stashed.Nonce != "" {
			idNonce := extractClaim(tokens.IDToken, "nonce")
			if idNonce == "" || idNonce != stashed.Nonce {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "id_token_nonce_mismatch"})
				return
			}
		}

		sub := extractSub(tokens.IDToken)
		expiresIn := tokens.ExpiresIn
		if expiresIn <= 0 {
			expiresIn = 3600
		}

		encrypted, err := s.encryptSession(sessionPayload{
			A: tokens.AccessToken,
			R: tokens.RefreshToken,
			D: tokens.IDToken,
			S: sub,
			X: time.Now().Unix() + int64(expiresIn),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "encrypt_failed"})
			return
		}

		s.writeSessionCookie(c, encrypted, expiresIn)

		target := stashed.ReturnTo
		if target == "" {
			target = "/"
		}
		c.Redirect(http.StatusFound, target)
	}
}

// RefreshHandler handles POST /auth/refresh.
func (s *SDK) RefreshHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie(s.cookieName())
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "no_session"})
			return
		}
		p, err := s.decryptSession(cookie)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
			return
		}
		if p.R == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "fedcm_refresh_required"})
			return
		}

		form := url.Values{}
		form.Set("grant_type", "refresh_token")
		form.Set("refresh_token", p.R)
		form.Set("client_id", s.cfg.ClientID)

		tokens, err := s.tokenExchange(c.Request.Context(), form)
		if err != nil {
			s.clearSessionCookie(c)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh_failed"})
			return
		}

		expiresIn := tokens.ExpiresIn
		if expiresIn <= 0 {
			expiresIn = 3600
		}

		encrypted, err := s.encryptSession(sessionPayload{
			A: tokens.AccessToken,
			R: tokens.RefreshToken,
			D: tokens.IDToken,
			S: p.S,
			X: time.Now().Unix() + int64(expiresIn),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "encrypt_failed"})
			return
		}
		s.writeSessionCookie(c, encrypted, expiresIn)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// LogoutHandler handles POST /auth/logout.
func (s *SDK) LogoutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		s.clearSessionCookie(c)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// FedcmExchangeHandler handles POST /auth/fedcm-exchange — optional FedCM ID token → session.
func (s *SDK) FedcmExchangeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var body struct {
			IDToken string `json:"id_token"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.IDToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing_id_token"})
			return
		}

		form := url.Values{}
		form.Set("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange")
		form.Set("subject_token", body.IDToken)
		form.Set("subject_token_type", "urn:ietf:params:oauth:token-type:id_token")
		form.Set("client_id", s.cfg.ClientID)

		tokens, err := s.tokenExchange(c.Request.Context(), form)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "fedcm_exchange_failed", "detail": err.Error()})
			return
		}

		sub := tokens.Sub
		if sub == "" {
			sub = extractSub(tokens.IDToken)
		}
		expiresIn := tokens.ExpiresIn
		if expiresIn <= 0 {
			expiresIn = 3600
		}

		encrypted, err := s.encryptSession(sessionPayload{
			A: tokens.AccessToken,
			R: tokens.RefreshToken,
			D: tokens.IDToken,
			S: sub,
			X: time.Now().Unix() + int64(expiresIn),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "encrypt_failed"})
			return
		}

		s.writeSessionCookie(c, encrypted, expiresIn)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// MeHandler returns the current identity from the session cookie.
func (s *SDK) MeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		sub, _ := c.Get("subject")
		payloadVal, exists := c.Get("payload")
		if !exists {
			c.JSON(http.StatusOK, gin.H{"id": sub})
			return
		}

		p, ok := payloadVal.(*sessionPayload)
		if !ok || p.D == "" {
			c.JSON(http.StatusOK, gin.H{"id": sub})
			return
		}

		claims := extractAllClaims(p.D)
		if claims == nil {
			c.JSON(http.StatusOK, gin.H{"id": sub})
			return
		}

		traits := make(map[string]any)
		if email, exists := claims["email"]; exists {
			traits["email"] = email
		}
		if name, exists := claims["name"]; exists {
			traits["name"] = name
		}
		if phone, exists := claims["phone"]; exists {
			traits["phone"] = phone
		}
		if emailVerified, exists := claims["email_verified"]; exists {
			traits["email_verified"] = emailVerified
		}

		c.JSON(http.StatusOK, gin.H{
			"id":     sub,
			"traits": traits,
		})
	}
}

// Middleware validates the session cookie and sets "subject" in the context.
func (s *SDK) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie(s.cookieName())
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no_session"})
			return
		}
		p, err := s.decryptSession(cookie)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
			return
		}
		if p.X > 0 && time.Now().Unix() > p.X {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "session_expired"})
			return
		}
		c.Set("subject", p.S)
		c.Set("payload", p)
		c.Next()
	}
}

func extractAllClaims(idToken string) map[string]any {
	parts := strings.Split(idToken, ".")
	if len(parts) < 2 {
		return nil
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil
	}
	var claims map[string]any
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil
	}
	return claims
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

func (s *SDK) stateKey(state string) string {
	prefix := s.cfg.StateKeyPrefix
	if prefix == "" {
		// Default matches §11 Redis key structure: oauth:ext:{state}
		prefix = "oauth:ext:"
	}
	return prefix + state
}

func (s *SDK) cookieName() string {
	base := s.cfg.SessionCookieName
	if base == "" {
		// Default matches §12.1: __Secure-binrc-external-auth.session-token
		base = "binrc-external-auth.session-token"
	}
	return "__Secure-" + base
}

func (s *SDK) writeSessionCookie(c *gin.Context, value string, maxAge int) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     s.cookieName(),
		Value:    value,
		Path:     "/",
		Domain:   s.cfg.CookieDomain,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *SDK) clearSessionCookie(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     s.cookieName(),
		Value:    "",
		Path:     "/",
		Domain:   s.cfg.CookieDomain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *SDK) buildStartURL(challenge, state, nonce string) string {
	u, _ := url.Parse(s.cfg.AdapterURL + "/api/oauth/start")
	q := u.Query()
	q.Set("app", s.cfg.ClientID)
	q.Set("code_challenge", challenge)
	q.Set("code_challenge_method", "S256")
	q.Set("state", state)
	q.Set("nonce", nonce)
	q.Set("response_mode", "form_post")
	q.Set("redirect_uri", s.cfg.RedirectURI)
	q.Set("scope", "openid offline_access")
	u.RawQuery = q.Encode()
	return u.String()
}

type tokenResp struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token"`
	ExpiresIn    int    `json:"expires_in"`
	Sub          string `json:"sub"`
}

func (s *SDK) tokenExchange(ctx context.Context, form url.Values) (*tokenResp, error) {
	req, err := http.NewRequestWithContext(ctx, "POST",
		s.cfg.AdapterURL+"/api/oauth/token",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if s.cfg.ClientSecret != "" {
		req.SetBasicAuth(s.cfg.ClientID, s.cfg.ClientSecret)
	}
	resp, err := s.httpClient().Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token endpoint returned %d", resp.StatusCode)
	}
	var t tokenResp
	if err := json.NewDecoder(resp.Body).Decode(&t); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}
	return &t, nil
}

// ─── Package-level Utilities ─────────────────────────────────────────────────

func generatePKCE() (verifier, challenge string, err error) {
	raw := make([]byte, 32)
	if _, err = io.ReadFull(rand.Reader, raw); err != nil {
		return
	}
	verifier = base64.RawURLEncoding.EncodeToString(raw)
	h := sha256.Sum256([]byte(verifier))
	challenge = base64.RawURLEncoding.EncodeToString(h[:])
	return
}

func randomBase64(n int) (string, error) {
	b := make([]byte, n)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func extractSub(idToken string) string {
	return extractClaim(idToken, "sub")
}

func extractClaim(idToken, claim string) string {
	parts := strings.Split(idToken, ".")
	if len(parts) < 2 {
		return ""
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ""
	}
	var claims map[string]any
	json.Unmarshal(payload, &claims)
	if v, ok := claims[claim].(string); ok {
		return v
	}
	return ""
}

// safeReturnTo enforces same-origin to prevent open-redirect abuse.
func safeReturnTo(raw, frontendURL string) string {
	if raw == "" {
		return "/"
	}
	// Reject common open-redirect bypass strings (e.g. starting with /\ or /space)
	if strings.HasPrefix(raw, "/\\") || strings.HasPrefix(raw, "/ ") || strings.HasPrefix(raw, "/\t") {
		return "/"
	}
	if strings.HasPrefix(raw, "/") && !strings.HasPrefix(raw, "//") {
		return raw
	}
	u, err := url.Parse(raw)
	if err != nil || u.Scheme != "https" {
		return "/"
	}
	if frontendURL == "" {
		return "/"
	}
	fu, err := url.Parse(frontendURL)
	if err != nil || u.Host != fu.Host {
		return "/"
	}
	return raw
}

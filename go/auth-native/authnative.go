// Package authnative provides authentication helpers for native clients
// (CLI tools, IoT devices, server-side daemons) that interact with the
// Binrc Adapter BFF. No external dependencies — standard library only.
//
// Adapter endpoints used:
//
//	POST /api/oauth/token          — code exchange & token refresh (public client, no secret needed)
//	POST /api/oauth/revoke         — token revocation
//	GET  /api/oauth/auth           — builds the authorization URL (opened in browser / WebView)
//	POST /api/oauth/device/token   — device code polling (SPIFFE-protected, call via your backend)
package authnative

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// ─── PKCE ─────────────────────────────────────────────────────────────────────

// PkceParams holds a PKCE verifier/challenge pair.
type PkceParams struct {
	Verifier  string
	Challenge string
	Method    string // always "S256"
}

// GeneratePkce creates a cryptographically random PKCE verifier and its S256 challenge.
func GeneratePkce() (PkceParams, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return PkceParams{}, fmt.Errorf("authnative: rand read: %w", err)
	}
	verifier := base64url(b)
	sum := sha256.Sum256([]byte(verifier))
	challenge := base64url(sum[:])
	return PkceParams{Verifier: verifier, Challenge: challenge, Method: "S256"}, nil
}

// RandomBase64url returns n random bytes encoded as base64url (no padding).
func RandomBase64url(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("authnative: rand read: %w", err)
	}
	return base64url(b), nil
}

func base64url(b []byte) string {
	return strings.NewReplacer("+", "-", "/", "_", "=", "").Replace(base64.StdEncoding.EncodeToString(b))
}

// ─── Authorization URL ────────────────────────────────────────────────────────

// AuthURLParams holds parameters for BuildAuthURL.
type AuthURLParams struct {
	AuthDomain  string // e.g. "https://auth.binrc.com"
	ClientID    string
	RedirectURI string // custom scheme e.g. "myapp://auth/callback" or "https://app.example.com/callback"
	Scope       string // defaults to "openid email profile offline_access"
	State       string
	Nonce       string
	Challenge   string // PKCE S256 challenge
}

// BuildAuthURL constructs the OIDC authorization URL pointing to /api/oauth/auth.
// Open this URL in a WebView or system browser.
func BuildAuthURL(p AuthURLParams) (string, error) {
	base, err := url.Parse(p.AuthDomain)
	if err != nil {
		return "", fmt.Errorf("authnative: invalid authDomain: %w", err)
	}
	base.Path = "/api/oauth/auth"
	scope := p.Scope
	if scope == "" {
		scope = "openid email profile offline_access"
	}
	q := url.Values{}
	q.Set("client_id", p.ClientID)
	q.Set("response_type", "code")
	q.Set("response_mode", "query")
	q.Set("code_challenge", p.Challenge)
	q.Set("code_challenge_method", "S256")
	q.Set("state", p.State)
	q.Set("nonce", p.Nonce)
	q.Set("redirect_uri", p.RedirectURI)
	q.Set("scope", scope)
	base.RawQuery = q.Encode()
	return base.String(), nil
}

// ─── Token types ──────────────────────────────────────────────────────────────

// TokenResponse is the response from /api/oauth/token.
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	IDToken      string `json:"id_token,omitempty"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	Scope        string `json:"scope,omitempty"`
}

// TokenError is returned when the token endpoint responds with an error.
type TokenError struct {
	StatusCode       int
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description,omitempty"`
}

func (e *TokenError) Err() error {
	if e.ErrorDescription != "" {
		return fmt.Errorf("authnative: token error %s (%d): %s", e.Error, e.StatusCode, e.ErrorDescription)
	}
	return fmt.Errorf("authnative: token error %s (%d)", e.Error, e.StatusCode)
}

// ─── Code Exchange ────────────────────────────────────────────────────────────

// CodeExchangeParams holds parameters for ExchangeCode.
type CodeExchangeParams struct {
	AuthDomain   string
	ClientID     string
	ClientSecret string // leave empty for public clients
	RedirectURI  string
	Code         string
	Verifier     string
}

// ExchangeCode exchanges an authorization code for tokens via /api/oauth/token.
// Public client: leave ClientSecret empty. Confidential client: set ClientSecret.
func ExchangeCode(ctx context.Context, p CodeExchangeParams) (*TokenResponse, error) {
	return ExchangeCodeWithClient(ctx, p, http.DefaultClient)
}

// ExchangeCodeWithClient is like ExchangeCode but uses a custom http.Client.
func ExchangeCodeWithClient(ctx context.Context, p CodeExchangeParams, client *http.Client) (*TokenResponse, error) {
	body := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {p.Code},
		"code_verifier": {p.Verifier},
		"redirect_uri":  {p.RedirectURI},
		"client_id":     {p.ClientID},
	}
	return doTokenRequest(ctx, p.AuthDomain, p.ClientID, p.ClientSecret, body, client)
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

// RefreshParams holds parameters for RefreshToken.
type RefreshParams struct {
	AuthDomain   string
	ClientID     string
	ClientSecret string // leave empty for public clients
	RefreshToken string
}

// RefreshToken refreshes an access token via /api/oauth/token.
func RefreshToken(ctx context.Context, p RefreshParams) (*TokenResponse, error) {
	return RefreshTokenWithClient(ctx, p, http.DefaultClient)
}

// RefreshTokenWithClient is like RefreshToken but uses a custom http.Client.
func RefreshTokenWithClient(ctx context.Context, p RefreshParams, client *http.Client) (*TokenResponse, error) {
	body := url.Values{
		"grant_type":    {"refresh_token"},
		"refresh_token": {p.RefreshToken},
		"client_id":     {p.ClientID},
	}
	return doTokenRequest(ctx, p.AuthDomain, p.ClientID, p.ClientSecret, body, client)
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

// RevokeToken revokes a token via /api/oauth/revoke.
func RevokeToken(ctx context.Context, authDomain, clientID, clientSecret, token string) error {
	return RevokeTokenWithClient(ctx, authDomain, clientID, clientSecret, token, http.DefaultClient)
}

// RevokeTokenWithClient is like RevokeToken but uses a custom http.Client.
func RevokeTokenWithClient(ctx context.Context, authDomain, clientID, clientSecret, token string, client *http.Client) error {
	endpoint := strings.TrimRight(authDomain, "/") + "/api/oauth/revoke"
	body := url.Values{"token": {token}, "client_id": {clientID}}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(body.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if clientSecret != "" {
		req.SetBasicAuth(clientID, clientSecret)
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

// ─── Device Flow (RFC 8628) ───────────────────────────────────────────────────

// DevicePollStatus represents the outcome of a single poll tick.
type DevicePollStatus int

const (
	DevicePollPending    DevicePollStatus = iota
	DevicePollSlowDown                    // interval should be increased by 5s
	DevicePollAuthorized                  // tokens available
	DevicePollDenied
	DevicePollExpired
)

// DevicePollResult is returned by PollDeviceToken.
type DevicePollResult struct {
	Status   DevicePollStatus
	Tokens   *TokenResponse // non-nil when Status == DevicePollAuthorized
	Interval int            // additional seconds to add when Status == DevicePollSlowDown
}

// DevicePollParams holds parameters for PollDeviceToken / PollUntilDone.
type DevicePollParams struct {
	// AuthDomain is the base URL of your backend proxy that calls
	// POST /api/oauth/device/token with a SPIFFE SVID.
	// Do NOT point this directly at auth.binrc.com from a desktop client
	// unless your client holds a valid SPIFFE SVID.
	AuthDomain string
	ClientID   string
	DeviceCode string
	// Interval is the initial poll interval in seconds (from DeviceSessionResponse).
	Interval int
}

// PollDeviceToken performs one poll tick against the device token endpoint.
// The endpoint must be SPIFFE-protected; call via your backend proxy.
func PollDeviceToken(ctx context.Context, p DevicePollParams) (*DevicePollResult, error) {
	return PollDeviceTokenWithClient(ctx, p, http.DefaultClient)
}

// PollDeviceTokenWithClient is like PollDeviceToken but uses a custom http.Client.
func PollDeviceTokenWithClient(ctx context.Context, p DevicePollParams, client *http.Client) (*DevicePollResult, error) {
	endpoint := strings.TrimRight(p.AuthDomain, "/") + "/api/oauth/device/token"

	payload, _ := json.Marshal(map[string]string{
		"device_code": p.DeviceCode,
		"grant_type":  "urn:ietf:params:oauth:grant-type:device_code",
		"client_id":   p.ClientID,
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(string(payload)))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusOK {
		var tokens TokenResponse
		if err := json.Unmarshal(b, &tokens); err != nil {
			return nil, fmt.Errorf("authnative: decode token response: %w", err)
		}
		return &DevicePollResult{Status: DevicePollAuthorized, Tokens: &tokens}, nil
	}

	var errBody struct {
		Error string `json:"error"`
	}
	_ = json.Unmarshal(b, &errBody)

	switch {
	case resp.StatusCode == 428 || errBody.Error == "authorization_pending":
		return &DevicePollResult{Status: DevicePollPending}, nil
	case resp.StatusCode == 403 && errBody.Error == "slow_down":
		return &DevicePollResult{Status: DevicePollSlowDown, Interval: 5}, nil
	case resp.StatusCode == 403 && errBody.Error == "access_denied":
		return &DevicePollResult{Status: DevicePollDenied}, nil
	case resp.StatusCode == 400 && errBody.Error == "expired_token":
		return &DevicePollResult{Status: DevicePollExpired}, nil
	default:
		return nil, fmt.Errorf("authnative: device poll: status %d, error %q", resp.StatusCode, errBody.Error)
	}
}

// ErrDeviceDenied is returned by PollUntilDone when the user denies authorization.
var ErrDeviceDenied = errors.New("authnative: device authorization denied")

// ErrDeviceExpired is returned by PollUntilDone when the device_code has expired.
var ErrDeviceExpired = errors.New("authnative: device_code expired")

// PollUntilDone polls until authorized, denied, expired, or ctx is cancelled.
// It respects slow_down by increasing the interval automatically.
// onPending is called (if non-nil) on each authorization_pending tick.
func PollUntilDone(ctx context.Context, p DevicePollParams, onPending func()) (*TokenResponse, error) {
	return PollUntilDoneWithClient(ctx, p, onPending, http.DefaultClient)
}

// PollUntilDoneWithClient is like PollUntilDone but uses a custom http.Client.
func PollUntilDoneWithClient(ctx context.Context, p DevicePollParams, onPending func(), client *http.Client) (*TokenResponse, error) {
	interval := p.Interval
	if interval <= 0 {
		interval = 5
	}
	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Duration(interval) * time.Second):
		}

		result, err := PollDeviceTokenWithClient(ctx, p, client)
		if err != nil {
			return nil, err
		}
		switch result.Status {
		case DevicePollAuthorized:
			return result.Tokens, nil
		case DevicePollDenied:
			return nil, ErrDeviceDenied
		case DevicePollExpired:
			return nil, ErrDeviceExpired
		case DevicePollSlowDown:
			interval += result.Interval
		case DevicePollPending:
			if onPending != nil {
				onPending()
			}
		}
	}
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

func doTokenRequest(ctx context.Context, authDomain, clientID, clientSecret string, body url.Values, client *http.Client) (*TokenResponse, error) {
	endpoint := strings.TrimRight(authDomain, "/") + "/api/oauth/token"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(body.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if clientSecret != "" {
		req.SetBasicAuth(clientID, clientSecret)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		var te TokenError
		_ = json.Unmarshal(b, &te)
		te.StatusCode = resp.StatusCode
		return nil, te.Err()
	}
	var tokens TokenResponse
	if err := json.Unmarshal(b, &tokens); err != nil {
		return nil, fmt.Errorf("authnative: decode token response: %w", err)
	}
	return &tokens, nil
}

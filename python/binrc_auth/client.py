import os
import time
import base64
import hashlib
import secrets
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass
import httpx
import jwt
from jwt import PyJWKClient

@dataclass
class SessionPayload:
    access_token: str
    refresh_token: Optional[str]
    id_token: Optional[str]
    sub: str
    exp: int

@dataclass
class UserInfo:
    sub: str
    name: Optional[str] = None
    email: Optional[str] = None
    email_verified: Optional[bool] = None
    phone: Optional[str] = None
    phone_verified: Optional[bool] = None
    avatar: Optional[str] = None

class BinrcAuthClient:
    """
    Public Binrc Auth client for Python web applications.
    Handles standard OIDC Authorization Code Flow with PKCE and JWKS signature verification.
    """
    def __init__(
        self,
        client_id: str,
        client_secret: Optional[str] = None,
        issuer_url: str = "https://auth.binrc.com",
        redirect_uri: Optional[str] = None,
    ):
        self.client_id = client_id
        self.client_secret = client_secret
        self.issuer_url = issuer_url.rstrip("/")
        self.redirect_uri = redirect_uri
        self.jwks_client = PyJWKClient(f"{self.issuer_url}/.well-known/jwks.json")

    def generate_pkce(self) -> Tuple[str, str]:
        """Generate PKCE verifier and S256 challenge."""
        verifier = secrets.token_urlsafe(48)
        challenge_bytes = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(challenge_bytes).decode("ascii").rstrip("=")
        return verifier, challenge

    def get_authorization_url(
        self,
        redirect_uri: Optional[str] = None,
        state: Optional[str] = None,
        code_challenge: Optional[str] = None,
        scope: str = "openid profile email",
    ) -> str:
        """Construct standard OIDC authorization URL."""
        target_redirect = redirect_uri or self.redirect_uri
        if not target_redirect:
            raise ValueError("redirect_uri is required")

        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": target_redirect,
            "scope": scope,
            "state": state or secrets.token_urlsafe(16),
        }
        if code_challenge:
            params["code_challenge"] = code_challenge
            params["code_challenge_method"] = "S256"

        query = "&".join(f"{k}={httpx.URL('', params={k: v}).query.decode('utf-8')}" for k, v in params.items())
        return f"{self.issuer_url}/oauth2/auth?{query}"

    async def exchange_code_for_tokens(
        self,
        code: str,
        code_verifier: Optional[str] = None,
        redirect_uri: Optional[str] = None,
    ) -> SessionPayload:
        """Exchange authorization code for tokens via token endpoint."""
        target_redirect = redirect_uri or self.redirect_uri
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": target_redirect,
            "client_id": self.client_id,
        }
        if self.client_secret:
            data["client_secret"] = self.client_secret
        if code_verifier:
            data["code_verifier"] = code_verifier

        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.issuer_url}/oauth2/token", data=data)
            resp.raise_for_status()
            token_data = resp.json()

        id_token = token_data.get("id_token")
        sub = ""
        if id_token:
            claims = self.verify_id_token(id_token)
            sub = claims.get("sub", "")

        expires_in = token_data.get("expires_in", 3600)
        return SessionPayload(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            id_token=id_token,
            sub=sub,
            exp=int(time.time()) + expires_in,
        )

    def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """Verify ID Token using public JWKS endpoint."""
        signing_key = self.jwks_client.get_signing_key_from_jwt(id_token)
        claims = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience=self.client_id,
            issuer=self.issuer_url,
        )
        return claims

    async def get_userinfo(self, access_token: str) -> UserInfo:
        """Fetch UserInfo profile using standard Bearer token."""
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.issuer_url}/userinfo", headers=headers)
            resp.raise_for_status()
            data = resp.json()

        return UserInfo(
            sub=data.get("sub", ""),
            name=data.get("name"),
            email=data.get("email"),
            email_verified=data.get("email_verified"),
            phone=data.get("phone"),
            phone_verified=data.get("phone_verified"),
            avatar=data.get("avatar") or data.get("picture"),
        )

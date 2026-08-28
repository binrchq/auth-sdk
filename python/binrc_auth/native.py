import time
import asyncio
from typing import Optional, Dict, Any, Tuple
import httpx
from .client import SessionPayload

class BinrcNativeAuth:
    """
    Public Native / CLI Assistant for Python applications.
    Supports standard OAuth 2.0 Device Authorization Grant (RFC 8628) and PKCE.
    """
    def __init__(self, client_id: str, issuer_url: str = "https://auth.binrc.com"):
        self.client_id = client_id
        self.issuer_url = issuer_url.rstrip("/")

    async def start_device_flow(self, scope: str = "openid profile email") -> Dict[str, Any]:
        """Request device verification code and user URI."""
        data = {
            "client_id": self.client_id,
            "scope": scope,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.issuer_url}/oauth2/device/code", data=data)
            resp.raise_for_status()
            return resp.json()

    async def poll_device_token(
        self,
        device_code: str,
        interval: int = 5,
        expires_in: int = 600,
    ) -> SessionPayload:
        """Poll the token endpoint until user approves or code expires."""
        deadline = time.time() + expires_in
        poll_interval = interval

        async with httpx.AsyncClient() as client:
            while time.time() < deadline:
                await asyncio.sleep(poll_interval)
                data = {
                    "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                    "client_id": self.client_id,
                    "device_code": device_code,
                }
                resp = await client.post(f"{self.issuer_url}/oauth2/token", data=data)
                if resp.status_code == 200:
                    token_data = resp.json()
                    exp = int(time.time()) + token_data.get("expires_in", 3600)
                    return SessionPayload(
                        access_token=token_data["access_token"],
                        refresh_token=token_data.get("refresh_token"),
                        id_token=token_data.get("id_token"),
                        sub=token_data.get("sub", ""),
                        exp=exp,
                    )
                
                body = resp.json()
                err = body.get("error")
                if err == "authorization_pending":
                    continue
                elif err == "slow_down":
                    poll_interval += 5
                    continue
                else:
                    raise RuntimeError(f"Device flow error: {err} - {body.get('error_description')}")

        raise TimeoutError("Device code expired before authorization was completed")

"""
Binrc Public Auth SDK for Python
Standard OIDC + PKCE client, FastAPI / Flask middleware, and Device flow.
"""

from .client import BinrcAuthClient, SessionPayload, UserInfo
from .native import BinrcNativeAuth

__version__ = "1.0.1"
__all__ = ["BinrcAuthClient", "BinrcNativeAuth", "SessionPayload", "UserInfo"]

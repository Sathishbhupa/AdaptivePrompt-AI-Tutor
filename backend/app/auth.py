import logging

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import settings

logger = logging.getLogger("adaptiveprompt.auth")
bearer = HTTPBearer(auto_error=False)

# Allow a little clock drift between this machine and Supabase (otherwise "iat/exp not valid yet" -> 401).
LEEWAY_SECONDS = 60


def _issuer() -> str:
    return settings.supabase_url + "/auth/v1"


def _jwks_url() -> str:
    return _issuer() + "/.well-known/jwks.json"


_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(_jwks_url(), cache_jwk_set=True, lifespan=600)
    return _jwks_client


def _verify_with_supabase_api(token: str) -> dict:
    """Last-resort check for legacy HS256 projects when SUPABASE_JWT_SECRET is not set.

    Asks Supabase Auth itself whether the token is valid, so no shared secret is required.
    """
    from .main_client import get_client  # local import avoids a circular import

    client = get_client()
    if client is None:
        raise ValueError("Supabase client is not configured")
    result = client.auth.get_user(token)
    user = getattr(result, "user", None)
    if not user or not getattr(user, "id", None):
        raise ValueError("Supabase rejected the token")
    return {"sub": str(user.id), "email": getattr(user, "email", None)}


def verify_token(token: str) -> dict:
    if not settings.supabase_url:
        raise HTTPException(503, "Authentication service is not configured (SUPABASE_URL is empty).")

    try:
        alg = jwt.get_unverified_header(token).get("alg", "")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Malformed authentication token.")

    common = dict(audience="authenticated", issuer=_issuer(), leeway=LEEWAY_SECONDS, options={"require": ["sub", "exp"]})

    try:
        if alg in ("RS256", "ES256"):
            key = _get_jwks_client().get_signing_key_from_jwt(token).key
            return jwt.decode(token, key, algorithms=["RS256", "ES256"], **common)

        if alg == "HS256":
            if settings.supabase_jwt_secret:
                return jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], **common)
            return _verify_with_supabase_api(token)

        logger.warning("Unsupported JWT algorithm: %s", alg)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired. Please sign in again.")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Supabase JWT verification failed (alg=%s, issuer=%s): %s", alg, _issuer(), exc)

    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired authentication token.")


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required.")
    return verify_token(credentials.credentials)

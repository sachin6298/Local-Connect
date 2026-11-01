import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional
from fastapi import Header, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings

class AuthenticatedUser(BaseModel):
    id: str
    email: str
    role: str = Field(default="tourist")
    full_name: Optional[str] = None
    is_authenticated: bool = True

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @property
    def is_lender(self) -> bool:
        return self.role == "lender"

    @property
    def is_tourist(self) -> bool:
        return self.role == "tourist"

def _base64url_decode(input_str: str) -> bytes:
    """Decode base64url-encoded string with padding normalization."""
    rem = len(input_str) % 4
    if rem > 0:
        input_str += "=" * (4 - rem)
    return base64.urlsafe_b64decode(input_str)

def _base64url_encode(input_bytes: bytes) -> str:
    """Encode bytes to base64url string without trailing padding."""
    return base64.urlsafe_b64encode(input_bytes).rstrip(b"=").decode("ascii")

def decode_and_verify_supabase_jwt(token: str, secret: Optional[str] = None) -> Dict[str, Any]:
    """
    Cryptographically verify Supabase Auth HS256 JWT.
    Enforces signature validity, expiration, and claims format.
    """
    jwt_secret = secret or settings.supabase_jwt_secret
    if not jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT secret is not configured on the backend."
        )

    parts = token.strip().split(".")
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    header_b64, payload_b64, signature_b64 = parts

    # 1. Verify Signature
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(jwt_secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    expected_sig_b64 = _base64url_encode(expected_sig)

    if not hmac.compare_digest(expected_sig_b64, signature_b64):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature. Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Decode Header & Payload
    try:
        header = json.loads(_base64url_decode(header_b64).decode("utf-8"))
        payload = json.loads(_base64url_decode(payload_b64).decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not parse token claims.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if header.get("alg") != "HS256":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unsupported JWT algorithm '{header.get('alg')}'. HS256 required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Verify Expiration
    exp = payload.get("exp")
    if exp is not None:
        if time.time() > float(exp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"The token has expired\""},
            )

    return payload

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_demo_user_id: Optional[str] = Header(None, alias="X-Demo-User-Id"),
    x_demo_role: Optional[str] = Header(None, alias="X-Demo-Role"),
    x_demo_name: Optional[str] = Header(None, alias="X-Demo-Name"),
) -> AuthenticatedUser:
    """
    FastAPI dependency to extract and verify the current authenticated user from Authorization header.
    Never trusts client-supplied user IDs or roles in production.
    In development mode with simulated users, accepts X-Demo headers if Authorization is absent.
    """
    demo_id = x_demo_user_id if isinstance(x_demo_user_id, str) else None
    demo_role = x_demo_role if isinstance(x_demo_role, str) else None
    demo_name = x_demo_name if isinstance(x_demo_name, str) else None

    if not authorization:
        # Development / demo environment fallback
        if settings.app_env != "production" and demo_id:
            role = demo_role if demo_role in ("tourist", "lender", "admin") else (
                "lender" if "lender" in demo_id
                else "admin" if "admin" in demo_id
                else "tourist"
            )
            name = demo_name or ("Radhe Mohan Sharma" if role == "lender" else "Operator Admin" if role == "admin" else "Ramesh Kumar")
            return AuthenticatedUser(
                id=demo_id,
                email=f"{demo_id}@localconnect.app",
                role=role,
                full_name=name,
                is_authenticated=True,
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing. Please authenticate.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Must be 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    claims = decode_and_verify_supabase_jwt(token)

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject (sub) missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Derive role from verified claims: user_metadata.role or role claim
    user_metadata = claims.get("user_metadata") or {}
    app_metadata = claims.get("app_metadata") or {}
    role = (
        app_metadata.get("role")
        or user_metadata.get("role")
        or claims.get("role")
        or "tourist"
    )

    if role not in ("tourist", "lender", "admin"):
        role = "tourist"

    full_name = user_metadata.get("full_name") or user_metadata.get("name") or "LocalConnect User"
    email = claims.get("email") or f"{user_id}@localconnect.app"

    return AuthenticatedUser(
        id=user_id,
        email=email,
        role=role,
        full_name=full_name,
        is_authenticated=True,
    )


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    """
    FastAPI dependency that returns the authenticated user if a valid token is provided,
    or None if no Authorization header is present. Raises 401 only for malformed/invalid tokens.
    """
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException as exc:
        # Malformed or expired token on an optional endpoint → still reject
        raise exc

def create_test_jwt(
    user_id: str,
    email: str,
    role: str = "tourist",
    full_name: str = "Test User",
    expires_in_seconds: int = 3600,
    secret: Optional[str] = None
) -> str:
    """
    Helper for automated test suites to construct validly signed HS256 Supabase JWTs.
    """
    jwt_secret = secret or settings.supabase_jwt_secret
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "role": "authenticated",
        "iat": now,
        "exp": now + expires_in_seconds,
        "user_metadata": {
            "role": role,
            "full_name": full_name,
        },
        "app_metadata": {
            "provider": "email",
            "role": role,
        }
    }

    header_b64 = _base64url_encode(json.dumps(header).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(payload).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    sig = hmac.new(jwt_secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(sig)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


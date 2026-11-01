from typing import Callable, Sequence
from fastapi import Depends, HTTPException, status
from app.core.auth import AuthenticatedUser, get_current_user

def require_role(*allowed_roles: str) -> Callable[[AuthenticatedUser], AuthenticatedUser]:
    """
    Dependency factory to enforce role-based access.
    Returns 403 Forbidden if user lacks permitted role.
    """
    def _role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}. Your role is '{current_user.role}'.",
            )
        return current_user
    return _role_checker

require_tourist = require_role("tourist", "admin")
require_lender = require_role("lender", "admin")
require_admin = require_role("admin")

def verify_user_ownership(actor: AuthenticatedUser, target_user_id: str) -> None:
    """
    Enforce resource ownership. Only the resource owner or an administrator
    is permitted to access or modify user-specific records.
    """
    if actor.id != target_user_id and not actor.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access or modify this user record.",
        )


from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.permissions import require_admin, require_lender, require_tourist, verify_user_ownership

router = APIRouter(prefix="", tags=["Users & Dashboards"])

# In-memory mock store for profile records in development/test
# (Mirrors public.profiles table schema)
_PROFILES_STORE: Dict[str, Dict[str, Any]] = {}

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    avatar_path: Optional[str] = None
    preferred_language: Optional[str] = Field(default=None, max_length=10)
    # Role change field: forbidden for non-admins
    role: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    phone: Optional[str] = None
    avatar_path: Optional[str] = None
    preferred_language: str = "en"

def _get_or_create_profile(user: AuthenticatedUser) -> Dict[str, Any]:
    if user.id not in _PROFILES_STORE:
        _PROFILES_STORE[user.id] = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name or "LocalConnect User",
            "phone": None,
            "avatar_path": None,
            "preferred_language": "en",
        }
    return _PROFILES_STORE[user.id]

@router.get("/users/me", response_model=UserProfileResponse)
def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Fetch current verified user profile."""
    profile = _get_or_create_profile(current_user)
    return UserProfileResponse(**profile)

@router.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Update authenticated user's own profile.
    Strictly forbids role elevation: non-admins cannot change their role.
    """
    profile = _get_or_create_profile(current_user)

    # Role Escalation Protection
    if payload.role is not None and payload.role != current_user.role:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: User role cannot be self-modified. Platform administrator privileges required.",
            )
        profile["role"] = payload.role

    if payload.full_name is not None:
        profile["full_name"] = payload.full_name
    if payload.phone is not None:
        profile["phone"] = payload.phone
    if payload.avatar_path is not None:
        profile["avatar_path"] = payload.avatar_path
    if payload.preferred_language is not None:
        profile["preferred_language"] = payload.preferred_language

    return UserProfileResponse(**profile)

@router.get("/users/{user_id}", response_model=UserProfileResponse)
def get_user_by_id(
    user_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Fetch specific user profile.
    Strictly prevents unauthorized cross-user access: only owner or admin allowed.
    """
    verify_user_ownership(current_user, user_id)

    if user_id not in _PROFILES_STORE:
        if user_id == current_user.id:
            profile = _get_or_create_profile(current_user)
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    else:
        profile = _PROFILES_STORE[user_id]

    return UserProfileResponse(**profile)

@router.patch("/users/{user_id}", response_model=UserProfileResponse)
def update_user_by_id(
    user_id: str,
    payload: ProfileUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Update specific user profile.
    Strictly prevents unauthorized cross-user modification.
    """
    verify_user_ownership(current_user, user_id)

    profile = _PROFILES_STORE.get(user_id) or _get_or_create_profile(current_user)

    if payload.role is not None and payload.role != profile["role"]:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: Admin privileges required to modify roles.",
            )
        profile["role"] = payload.role

    if payload.full_name is not None:
        profile["full_name"] = payload.full_name
    if payload.phone is not None:
        profile["phone"] = payload.phone
    if payload.avatar_path is not None:
        profile["avatar_path"] = payload.avatar_path
    if payload.preferred_language is not None:
        profile["preferred_language"] = payload.preferred_language

    return UserProfileResponse(**profile)

# ----------------------------------------------------------------------
# Role-Specific Dashboard Endpoints
# ----------------------------------------------------------------------

@router.get("/dashboard/tourist")
def get_tourist_dashboard(current_user: AuthenticatedUser = Depends(require_tourist)):
    """Tourist dashboard summary (requires tourist or admin role)."""
    return {
        "status": "success",
        "role": current_user.role,
        "user_id": current_user.id,
        "message": f"Welcome back, {current_user.full_name}! Here are your active rentals in Gaya Ji.",
        "active_rentals_count": 0,
        "saved_items_count": 0,
    }

@router.get("/dashboard/lender")
def get_lender_dashboard(current_user: AuthenticatedUser = Depends(require_lender)):
    """Lender dashboard summary (requires lender or admin role)."""
    return {
        "status": "success",
        "role": current_user.role,
        "user_id": current_user.id,
        "message": f"Namaste, {current_user.full_name}! Lender portal overview.",
        "active_listings_count": 0,
        "pending_requests_count": 0,
        "verification_status": "approved" if current_user.is_admin else "draft",
    }

@router.get("/dashboard/admin")
def get_admin_dashboard(current_user: AuthenticatedUser = Depends(require_admin)):
    """Platform operator supervision dashboard (strictly admin only)."""
    return {
        "status": "success",
        "role": "admin",
        "user_id": current_user.id,
        "message": "LocalConnect Platform Operator Console",
        "pending_lender_approvals": 0,
        "active_disputes": 0,
        "total_active_listings": 4,
    }


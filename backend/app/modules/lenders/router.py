from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import AuthenticatedUser, get_current_user, get_optional_user
from app.core.permissions import require_admin, require_lender
from app.modules.lenders.schemas import (
    LenderDecisionRequest,
    LenderOnboardingRequest,
    LenderProfileResponse,
    LenderVerificationSubmission,
    PublicLenderProfileResponse,
)

router = APIRouter(prefix="/lenders", tags=["Lender Profiles & Verification"])
admin_router = APIRouter(prefix="/admin/lenders", tags=["Admin Lender Approvals"])

# In-memory store mirroring lender_profiles table
# Key: lender user_id (UUID)
_LENDERS_STORE: Dict[str, Dict[str, Any]] = {}

def get_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def get_or_create_lender_record(user: AuthenticatedUser) -> Dict[str, Any]:
    if user.id not in _LENDERS_STORE:
        now = get_now_iso()
        _LENDERS_STORE[user.id] = {
            "user_id": user.id,
            "display_name": user.full_name or "Local Lender",
            "description": None,
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Gaya Ji (Vishnupad & Nearby)",
            "public_area_label": "Vishnupad Ghat Area",
            "verification_status": "draft",  # draft, submitted, approved, rejected, suspended
            "verification_note": None,
            "verification_document_paths": [],
            "languages": ["Hindi", "English"],
            "created_at": now,
            "updated_at": now,
        }
    return _LENDERS_STORE[user.id]

def is_lender_approved(lender_id: str) -> bool:
    lender = _LENDERS_STORE.get(lender_id)
    if not lender:
        return False
    return lender.get("verification_status") == "approved"

@router.get("/me", response_model=LenderProfileResponse)
def get_my_lender_profile(
    current_user: AuthenticatedUser = Depends(require_lender)
):
    """Fetch current authenticated lender profile and verification status."""
    lender = get_or_create_lender_record(current_user)
    return LenderProfileResponse(**lender)

@router.post("/onboarding", response_model=LenderProfileResponse)
def onboard_lender_details(
    payload: LenderOnboardingRequest,
    current_user: AuthenticatedUser = Depends(require_lender)
):
    """Update profile bio, locality info, and public area label (never private address)."""
    lender = get_or_create_lender_record(current_user)
    lender["display_name"] = payload.display_name
    lender["description"] = payload.description
    if payload.locality_id:
        lender["locality_id"] = payload.locality_id
    lender["public_area_label"] = payload.public_area_label
    lender["languages"] = payload.languages
    lender["updated_at"] = get_now_iso()
    return LenderProfileResponse(**lender)

@router.post("/verification", response_model=LenderProfileResponse)
def submit_verification_documents(
    payload: LenderVerificationSubmission,
    current_user: AuthenticatedUser = Depends(require_lender)
):
    """
    Submit verification document paths (uploaded to private storage bucket).
    Transitions lender verification status from draft -> submitted.
    """
    lender = get_or_create_lender_record(current_user)
    lender["verification_document_paths"] = payload.document_paths
    lender["verification_status"] = "submitted"
    lender["verification_note"] = payload.notes
    lender["updated_at"] = get_now_iso()
    return LenderProfileResponse(**lender)

@router.get("/{user_id}", response_model=PublicLenderProfileResponse)
def get_public_lender_profile(
    user_id: str,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """
    Fetch public lender profile.
    Only approved lenders are visible to tourists.
    Lender owner and admin can view non-approved profile.
    """
    if user_id not in _LENDERS_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile not found."
        )

    lender = _LENDERS_STORE[user_id]
    is_owner = current_user and current_user.id == user_id
    is_admin_user = current_user and current_user.is_admin

    if lender["verification_status"] != "approved" and not (is_owner or is_admin_user):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender is pending administrative verification."
        )

    return PublicLenderProfileResponse(
        user_id=lender["user_id"],
        display_name=lender["display_name"],
        description=lender["description"],
        locality_name=lender.get("locality_name"),
        public_area_label=lender["public_area_label"],
        verification_status=lender["verification_status"],
        languages=lender["languages"]
    )

@admin_router.get("", response_model=List[LenderProfileResponse])
def list_all_lenders(
    status_filter: Optional[str] = None,
    current_user: AuthenticatedUser = Depends(require_admin)
):
    """Admin endpoint to list all registered lenders and their verification statuses."""
    results = list(_LENDERS_STORE.values())
    if status_filter:
        results = [l for l in results if l.get("verification_status") == status_filter]
    return [LenderProfileResponse(**l) for l in results]


@admin_router.post("/{lender_id}/decision", response_model=LenderProfileResponse)
def decide_lender_verification(
    lender_id: str,
    payload: LenderDecisionRequest,
    current_user: AuthenticatedUser = Depends(require_admin)
):
    """
    Administrative endpoint to approve, reject, or suspend a local lender.
    Admin approval is required before items appear as verified public listings.
    """
    if lender_id not in _LENDERS_STORE:
        now = get_now_iso()
        _LENDERS_STORE[lender_id] = {
            "user_id": lender_id,
            "display_name": "Local Lender",
            "description": None,
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Gaya Ji (Vishnupad & Nearby)",
            "public_area_label": "Vishnupad Area",
            "verification_status": "draft",
            "verification_note": None,
            "verification_document_paths": [],
            "languages": ["Hindi"],
            "created_at": now,
            "updated_at": now,
        }

    lender = _LENDERS_STORE[lender_id]
    lender["verification_status"] = payload.decision
    if payload.note:
        lender["verification_note"] = payload.note
    lender["updated_at"] = get_now_iso()
    return LenderProfileResponse(**lender)

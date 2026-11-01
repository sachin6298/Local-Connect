import math
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.permissions import require_lender, require_tourist
from app.modules.items.router import _ITEMS_STORE
from app.modules.lenders.router import _LENDERS_STORE
from app.modules.requests.schemas import (
    CreateRentalRequestPayload,
    RentalRequestResponse,
    UpdateRequestStatusPayload,
)

router = APIRouter(prefix="", tags=["Rental Requests"])

# In-memory request store (mirrors rental_requests table)
_REQUESTS_STORE: Dict[str, Dict[str, Any]] = {}

# In-memory notifications store
_NOTIFICATIONS_STORE: Dict[str, List[Dict[str, Any]]] = {}


def get_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _create_notification(recipient_id: str, title: str, content: str, ref_id: str) -> None:
    notif = {
        "id": str(uuid.uuid4()),
        "recipient_id": recipient_id,
        "title": title,
        "content": content,
        "reference_id": ref_id,
        "read_at": None,
        "created_at": get_now_iso(),
    }
    _NOTIFICATIONS_STORE.setdefault(recipient_id, []).append(notif)


def _calculate_days(start: str, end: str) -> int:
    from datetime import date
    s = date.fromisoformat(start)
    e = date.fromisoformat(end)
    return max((e - s).days, 1)


def _check_availability(item_id: str, start: str, end: str, quantity: int, exclude_request_id: Optional[str] = None) -> int:
    """Return available quantity for date range. O(n) over requests — acceptable for demo scale."""
    item = _ITEMS_STORE.get(item_id)
    if not item:
        return 0
    total = item.get("total_quantity", 0)
    reserved = 0
    for req in _REQUESTS_STORE.values():
        if req["item_id"] != item_id:
            continue
        if req["status"] not in ("requested", "accepted", "active"):
            continue
        if exclude_request_id and req["id"] == exclude_request_id:
            continue
        # Overlap check: [a,b) overlaps [c,d) if a < d and c < b
        if req["rental_start"] < end and start < req["rental_end"]:
            reserved += req["quantity"]
    return total - reserved


def _to_response(req: Dict[str, Any]) -> RentalRequestResponse:
    return RentalRequestResponse(**req)


@router.post("/requests", response_model=RentalRequestResponse, status_code=201)
def create_rental_request(
    payload: CreateRentalRequestPayload,
    current_user: AuthenticatedUser = Depends(require_tourist),
):
    """Tourist submits a rental request. Validates availability atomically."""
    item = _ITEMS_STORE.get(payload.item_id)
    if not item:
        raise HTTPException(404, "Item not found.")
    if item.get("status") != "active":
        raise HTTPException(400, "Item is not currently available for rental.")

    lender_id = item["lender_id"]
    start_str = payload.rental_start.isoformat()
    end_str = payload.rental_end.isoformat()

    available = _check_availability(payload.item_id, start_str, end_str, payload.quantity)
    if available < payload.quantity:
        raise HTTPException(
            400,
            f"Insufficient availability. Only {max(available, 0)} unit(s) available for the selected dates."
        )

    days = _calculate_days(start_str, end_str)
    subtotal = round(item["price_amount"] * days * payload.quantity, 2)
    platform_fee = round(subtotal * 0.10, 2)
    total = round(subtotal + platform_fee, 2)

    lender_rec = _LENDERS_STORE.get(lender_id, {})
    lender_name = lender_rec.get("display_name") or item.get("lender_name") or "Local Lender"

    req_id = str(uuid.uuid4())
    now = get_now_iso()
    req_data = {
        "id": req_id,
        "tourist_id": current_user.id,
        "lender_id": lender_id,
        "item_id": payload.item_id,
        "item_title": item["title"],
        "tourist_name": current_user.full_name or "Tourist",
        "tourist_email": current_user.email,
        "lender_name": lender_name,
        "quantity": payload.quantity,
        "rental_start": start_str,
        "rental_end": end_str,
        "handover_method": payload.handover_method,
        "tourist_note": payload.tourist_note,
        "rental_subtotal": subtotal,
        "platform_fee": platform_fee,
        "total_amount": total,
        "currency": "INR",
        "status": "requested",
        "created_at": now,
        "updated_at": now,
    }
    _REQUESTS_STORE[req_id] = req_data

    _create_notification(
        lender_id,
        "New Rental Request",
        f"{current_user.full_name or 'A tourist'} requested {payload.quantity}x '{item['title']}' from {start_str} to {end_str}.",
        req_id,
    )

    return _to_response(req_data)


@router.get("/requests/mine", response_model=List[RentalRequestResponse])
def list_my_requests(
    role_filter: Optional[str] = Query(default=None, description="tourist|lender"),
    req_status: Optional[str] = Query(default=None, alias="status"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    For tourists: returns requests they submitted.
    For lenders: returns requests on their items.
    For admins: returns all requests.
    """
    results = []
    for req in _REQUESTS_STORE.values():
        if current_user.is_admin:
            results.append(req)
        elif current_user.is_lender:
            if req["lender_id"] == current_user.id:
                results.append(req)
        else:
            if req["tourist_id"] == current_user.id:
                results.append(req)

    if req_status:
        results = [r for r in results if r["status"] == req_status]

    results.sort(key=lambda x: x["created_at"], reverse=True)
    return [_to_response(r) for r in results]


@router.get("/requests/{request_id}", response_model=RentalRequestResponse)
def get_request_detail(
    request_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Get a single request. Only the tourist, lender, or admin may access it."""
    req = _REQUESTS_STORE.get(request_id)
    if not req:
        raise HTTPException(404, "Request not found.")

    is_participant = (
        current_user.id == req["tourist_id"]
        or current_user.id == req["lender_id"]
        or current_user.is_admin
    )
    if not is_participant:
        raise HTTPException(403, "Forbidden.")

    return _to_response(req)


@router.post("/requests/{request_id}/accept", response_model=RentalRequestResponse)
def accept_request(
    request_id: str,
    payload: UpdateRequestStatusPayload,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """Lender accepts a pending request."""
    req = _REQUESTS_STORE.get(request_id)
    if not req:
        raise HTTPException(404, "Request not found.")
    if req["lender_id"] != current_user.id:
        raise HTTPException(403, "You can only manage your own requests.")
    if req["status"] != "requested":
        raise HTTPException(400, f"Cannot accept a request in '{req['status']}' state.")

    # Re-check availability to prevent race conditions
    available = _check_availability(
        req["item_id"], req["rental_start"], req["rental_end"],
        req["quantity"], exclude_request_id=request_id
    )
    if available < req["quantity"]:
        raise HTTPException(409, "Availability conflict: another request was accepted first.")

    req["status"] = "accepted"
    req["updated_at"] = get_now_iso()

    _create_notification(
        req["tourist_id"],
        "Rental Request Accepted!",
        f"Your request for '{req['item_title']}' has been accepted by {current_user.full_name or 'the lender'}.",
        request_id,
    )
    return _to_response(req)


@router.post("/requests/{request_id}/reject", response_model=RentalRequestResponse)
def reject_request(
    request_id: str,
    payload: UpdateRequestStatusPayload,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """Lender rejects a request."""
    req = _REQUESTS_STORE.get(request_id)
    if not req:
        raise HTTPException(404, "Request not found.")
    if req["lender_id"] != current_user.id:
        raise HTTPException(403, "You can only manage your own requests.")
    if req["status"] not in ("requested", "accepted"):
        raise HTTPException(400, f"Cannot reject a request in '{req['status']}' state.")

    req["status"] = "rejected"
    req["updated_at"] = get_now_iso()

    _create_notification(
        req["tourist_id"],
        "Rental Request Update",
        f"Your request for '{req['item_title']}' was not accepted. Reason: {payload.reason or 'No reason provided'}.",
        request_id,
    )
    return _to_response(req)


@router.post("/requests/{request_id}/cancel", response_model=RentalRequestResponse)
def cancel_request(
    request_id: str,
    payload: UpdateRequestStatusPayload,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Tourist cancels a pending/accepted request."""
    req = _REQUESTS_STORE.get(request_id)
    if not req:
        raise HTTPException(404, "Request not found.")

    is_tourist_owner = current_user.id == req["tourist_id"]
    is_admin = current_user.is_admin
    if not (is_tourist_owner or is_admin):
        raise HTTPException(403, "Only the requesting tourist or admin can cancel this request.")

    if req["status"] not in ("requested", "accepted"):
        raise HTTPException(400, f"Cannot cancel a request in '{req['status']}' state.")

    req["status"] = "cancelled"
    req["updated_at"] = get_now_iso()

    _create_notification(
        req["lender_id"],
        "Request Cancelled",
        f"Tourist {req['tourist_name']} cancelled the request for '{req['item_title']}'.",
        request_id,
    )
    return _to_response(req)


@router.get("/items/{item_id}/availability")
def get_item_availability(
    item_id: str,
    start: str = Query(..., description="ISO date YYYY-MM-DD"),
    end: str = Query(..., description="ISO date YYYY-MM-DD"),
):
    """Returns available quantity for the given date range."""
    item = _ITEMS_STORE.get(item_id)
    if not item:
        raise HTTPException(404, "Item not found.")

    try:
        from datetime import date
        s = date.fromisoformat(start)
        e = date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD.")

    if e <= s:
        raise HTTPException(400, "End date must be after start date.")

    total = item.get("total_quantity", 0)
    available = _check_availability(item_id, start, end, 0)

    return {
        "item_id": item_id,
        "total_quantity": total,
        "available_quantity": max(available, 0),
        "reserved_quantity": total - max(available, 0),
        "status": (
            "unavailable" if available <= 0
            else "partially_available" if available < total
            else "available"
        ),
    }

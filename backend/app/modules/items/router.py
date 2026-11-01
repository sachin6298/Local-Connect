import math
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.permissions import require_admin, require_lender, verify_user_ownership
from app.modules.items.schemas import (
    CategoryResponse,
    ItemCreateRequest,
    ItemResponse,
    ItemUpdateRequest,
    LocalityResponse,
    PaginatedItemsResponse,
)
from app.modules.lenders.router import _LENDERS_STORE, is_lender_approved

router = APIRouter(prefix="", tags=["Rental Items & Marketplace"])

# Seed data categories matching database/seed/00001_gaya_initial_seed.sql
CATEGORIES: List[Dict[str, str]] = [
    {
        "id": "c1111111-1111-1111-1111-111111111111",
        "name": "Clothing",
        "slug": "clothing",
        "description": "Traditional dhotis, cotton kurtas, shawls, and pilgrimage attire.",
        "icon_key": "shirt",
    },
    {
        "id": "c2222222-2222-2222-2222-222222222222",
        "name": "Backpacks",
        "slug": "backpacks",
        "description": "Travel rucksacks, daypacks, and durable luggage bags.",
        "icon_key": "backpack",
    },
    {
        "id": "c3333333-3333-3333-3333-333333333333",
        "name": "Utensils",
        "slug": "utensils",
        "description": "Stainless-steel and brass cooking sets, dining thalis, and jugs.",
        "icon_key": "cooking-pot",
    },
    {
        "id": "c4444444-4444-4444-4444-444444444444",
        "name": "Puja materials",
        "slug": "puja-materials",
        "description": "Brass lamps, ritual thalis, aarti bells, and pind-daan matting.",
        "icon_key": "flower",
    },
    {
        "id": "c5555555-5555-5555-5555-555555555555",
        "name": "Household essentials",
        "slug": "household-essentials",
        "description": "Mats, blankets, emergency lamps, and temporary stay basics.",
        "icon_key": "home",
    },
    {
        "id": "c6666666-6666-6666-6666-666666666666",
        "name": "Daily-use items",
        "slug": "daily-use-items",
        "description": "Umbrellas, walking canes, shoe bags, and portable water flasks.",
        "icon_key": "package",
    },
]

LOCALITIES: List[Dict[str, str]] = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Vishnupad & Falgu Ghat Area",
        "city": "Gaya",
        "state": "Bihar",
        "slug": "vishnupad-gaya",
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Gaya Junction & Station Road",
        "city": "Gaya",
        "state": "Bihar",
        "slug": "gaya-junction",
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Bodh Gaya Temple Precinct",
        "city": "Bodh Gaya",
        "state": "Bihar",
        "slug": "bodh-gaya",
    },
]

# In-memory item store mirroring rental_items table
_ITEMS_STORE: Dict[str, Dict[str, Any]] = {}

def get_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def seed_initial_items():
    """Populate default items for development and demonstration."""
    if _ITEMS_STORE:
        return
    now = get_now_iso()
    sharma_id = "demo-lender-01"
    if sharma_id not in _LENDERS_STORE:
        _LENDERS_STORE[sharma_id] = {
            "user_id": sharma_id,
            "display_name": "Sharma Family Rentals",
            "description": "Local family near Vishnupad temple providing clean ceremonial clothes and utensils.",
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Gaya Ji (Vishnupad & Nearby)",
            "public_area_label": "Vishnupad Ghat Area",
            "verification_status": "approved",
            "verification_note": "Verified by admin",
            "verification_document_paths": [],
            "languages": ["Hindi", "English"],
            "created_at": now,
            "updated_at": now,
        }

    seeds = [
        {
            "id": "sample-1",
            "lender_id": sharma_id,
            "lender_name": "Sharma Family Rentals",
            "lender_verified": True,
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "category_name": "Clothing",
            "title": "White cotton dhoti & kurta set",
            "description": "Pure cotton consecrated traditional dhoti and kurta set for Gaya Ji Pind-daan rituals.",
            "condition_label": "Very good",
            "size_or_variant": "Standard free size",
            "total_quantity": 8,
            "price_amount": 120.0,
            "price_unit": "day",
            "currency": "INR",
            "pickup_available": True,
            "delivery_available": False,
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Vishnupad area, Gaya",
            "public_location_label": "Vishnupad Main Gate, Gaya",
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85"],
            "primary_image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "sample-2",
            "lender_id": sharma_id,
            "lender_name": "Sharma Family Rentals",
            "lender_verified": True,
            "category_id": "c4444444-4444-4444-4444-444444444444",
            "category_name": "Puja materials",
            "title": "Puja thali & utensil kit",
            "description": "Complete brass ceremonial kit including thali, ghanti, diya, and panchapatra.",
            "condition_label": "Clean · Sanitised",
            "size_or_variant": "Standard ritual size",
            "total_quantity": 6,
            "price_amount": 80.0,
            "price_unit": "day",
            "currency": "INR",
            "pickup_available": True,
            "delivery_available": False,
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Deoghat, Gaya",
            "public_location_label": "Deoghat Riverside, Gaya",
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=900&q=85"],
            "primary_image": "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=900&q=85",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "sample-3",
            "lender_id": sharma_id,
            "lender_name": "Sharma Family Rentals",
            "lender_verified": True,
            "category_id": "c2222222-2222-2222-2222-222222222222",
            "category_name": "Backpacks",
            "title": "Travel backpack · 40L",
            "description": "Waterproof rucksack with padded straps, ideal for carrying pilgrimage essentials.",
            "condition_label": "Good",
            "size_or_variant": "40 Litres",
            "total_quantity": 4,
            "price_amount": 60.0,
            "price_unit": "day",
            "currency": "INR",
            "pickup_available": True,
            "delivery_available": True,
            "locality_id": "22222222-2222-2222-2222-222222222222",
            "locality_name": "Gaya Junction area",
            "public_location_label": "Gaya Junction Railway Area",
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85"],
            "primary_image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "sample-4",
            "lender_id": sharma_id,
            "lender_name": "Sharma Family Rentals",
            "lender_verified": True,
            "category_id": "c3333333-3333-3333-3333-333333333333",
            "category_name": "Utensils",
            "title": "Stainless-steel utensil set",
            "description": "Sanitized stainless-steel dining and cookset for family travel stays.",
            "condition_label": "Very good",
            "size_or_variant": "Family set (4 persons)",
            "total_quantity": 5,
            "price_amount": 100.0,
            "price_unit": "day",
            "currency": "INR",
            "pickup_available": True,
            "delivery_available": False,
            "locality_id": "11111111-1111-1111-1111-111111111111",
            "locality_name": "Mangla Gauri area, Gaya",
            "public_location_label": "Mangla Gauri Road, Gaya",
            "status": "active",
            "images": ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=85"],
            "primary_image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=85",
            "created_at": now,
            "updated_at": now,
        },
    ]
    for s in seeds:
        _ITEMS_STORE[s["id"]] = s

def get_category_name(category_id: str) -> str:
    for cat in CATEGORIES:
        if cat["id"] == category_id:
            return cat["name"]
    return "Miscellaneous"

def get_locality_name(locality_id: str) -> str:
    for loc in LOCALITIES:
        if loc["id"] == locality_id:
            return loc["name"]
    return "Gaya Ji"

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories():
    """Retrieve all approved commodity rental categories."""
    return [CategoryResponse(**c) for c in CATEGORIES]

@router.get("/localities", response_model=List[LocalityResponse])
def list_localities():
    """Retrieve all supported rental localities."""
    return [LocalityResponse(**loc) for loc in LOCALITIES]

@router.get("/items", response_model=PaginatedItemsResponse)
def list_public_items(
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    locality_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
):
    """
    Search and browse public marketplace items.
    INVARIANT: An item appears in public search ONLY IF:
    1. Item status is 'active'
    2. Lender is approved by administrator.
    """
    results: List[Dict[str, Any]] = []

    for item in _ITEMS_STORE.values():
        if item.get("status") != "active":
            continue

        lender_id = item.get("lender_id")
        # Check lender approval status
        if not is_lender_approved(lender_id):
            continue

        if category_id and item.get("category_id") != category_id:
            continue

        if locality_id and item.get("locality_id") != locality_id:
            continue

        if q:
            search_str = f"{item['title']} {item['description']} {item['public_location_label']}".lower()
            if q.lower() not in search_str:
                continue

        results.append(item)

    # Sort newest first
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    total = len(results)
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    paged_items = results[offset : offset + page_size]

    return PaginatedItemsResponse(
        items=[ItemResponse(**it) for it in paged_items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.get("/items/mine", response_model=PaginatedItemsResponse)
def list_my_items(
    page: int = 1,
    page_size: int = 10,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """
    Fetch all items owned by current lender (active, draft, paused).
    Prevents N+1 queries by projecting clean paginated structures.
    """
    my_items = [
        it for it in _ITEMS_STORE.values()
        if it.get("lender_id") == current_user.id
    ]
    my_items.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    total = len(my_items)
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    paged_items = my_items[offset : offset + page_size]

    return PaginatedItemsResponse(
        items=[ItemResponse(**it) for it in paged_items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.get("/items/{item_id}", response_model=ItemResponse)
def get_item_by_id(
    item_id: str,
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user),
):
    """
    Fetch single item detail.
    Non-active items are visible only to the item owner or platform admin.
    """
    if item_id not in _ITEMS_STORE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    item = _ITEMS_STORE[item_id]
    lender_id = item["lender_id"]

    is_owner = current_user and current_user.id == lender_id
    is_admin_user = current_user and current_user.is_admin

    if item["status"] != "active" or not is_lender_approved(lender_id):
        if not (is_owner or is_admin_user):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item is not available.")

    return ItemResponse(**item)

@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_rental_item(
    payload: ItemCreateRequest,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """
    Create a new rentable commodity listing.
    Status is 'active' if lender is approved by admin, otherwise 'draft'.
    """
    item_id = str(uuid.uuid4())
    now = get_now_iso()

    # Determine status based on lender verification
    approved = is_lender_approved(current_user.id)
    initial_status = "active" if approved else "draft"

    category_name = get_category_name(payload.category_id)
    locality_id = payload.locality_id or "11111111-1111-1111-1111-111111111111"
    locality_name = get_locality_name(locality_id)

    lender_record = _LENDERS_STORE.get(current_user.id, {})
    lender_name = lender_record.get("display_name") or current_user.full_name or "Local Lender"

    primary_image = payload.images[0] if payload.images else "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800"

    item_data = {
        "id": item_id,
        "lender_id": current_user.id,
        "lender_name": lender_name,
        "lender_verified": approved,
        "category_id": payload.category_id,
        "category_name": category_name,
        "title": payload.title,
        "description": payload.description,
        "condition_label": payload.condition_label,
        "size_or_variant": payload.size_or_variant,
        "total_quantity": payload.total_quantity,
        "price_amount": payload.price_amount,
        "price_unit": payload.price_unit,
        "currency": "INR",
        "pickup_available": payload.pickup_available,
        "delivery_available": payload.delivery_available,
        "locality_id": locality_id,
        "locality_name": locality_name,
        "public_location_label": payload.public_location_label,
        "status": initial_status,
        "images": payload.images or [primary_image],
        "primary_image": primary_image,
        "created_at": now,
        "updated_at": now,
    }

    _ITEMS_STORE[item_id] = item_data
    return ItemResponse(**item_data)

@router.patch("/items/{item_id}", response_model=ItemResponse)
def update_rental_item(
    item_id: str,
    payload: ItemUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """
    Update item listing.
    SECURITY: A lender can modify only their own items.
    """
    if item_id not in _ITEMS_STORE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    item = _ITEMS_STORE[item_id]

    # Verify ownership
    is_owner = (
        item["lender_id"] == current_user.id
        or (item["lender_id"] == "demo-lender-01" and current_user.email == "sharma.lender@example.com")
    )
    if not is_owner and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can modify only your own items.",
        )

    if payload.title is not None:
        item["title"] = payload.title
    if payload.category_id is not None:
        item["category_id"] = payload.category_id
        item["category_name"] = get_category_name(payload.category_id)
    if payload.description is not None:
        item["description"] = payload.description
    if payload.condition_label is not None:
        item["condition_label"] = payload.condition_label
    if payload.size_or_variant is not None:
        item["size_or_variant"] = payload.size_or_variant
    if payload.total_quantity is not None:
        item["total_quantity"] = payload.total_quantity
    if payload.price_amount is not None:
        item["price_amount"] = payload.price_amount
    if payload.price_unit is not None:
        item["price_unit"] = payload.price_unit
    if payload.pickup_available is not None:
        item["pickup_available"] = payload.pickup_available
    if payload.delivery_available is not None:
        item["delivery_available"] = payload.delivery_available
    if payload.public_location_label is not None:
        item["public_location_label"] = payload.public_location_label
    if payload.images is not None:
        item["images"] = payload.images
        if payload.images:
            item["primary_image"] = payload.images[0]
    if payload.status is not None:
        # If reactivating, ensure lender is verified
        if payload.status == "active" and not is_lender_approved(item["lender_id"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot activate item: Lender must be approved by admin before listings can become active.",
            )
        item["status"] = payload.status

    item["updated_at"] = get_now_iso()
    return ItemResponse(**item)

@router.post("/items/{item_id}/deactivate", response_model=ItemResponse)
def deactivate_rental_item(
    item_id: str,
    current_user: AuthenticatedUser = Depends(require_lender),
):
    """Pause an active listing."""
    if item_id not in _ITEMS_STORE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    item = _ITEMS_STORE[item_id]
    if item["lender_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can modify only your own items.",
        )

    item["status"] = "paused"
    item["updated_at"] = get_now_iso()
    return ItemResponse(**item)

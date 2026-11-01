from typing import List, Optional
from pydantic import BaseModel, Field

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon_key: Optional[str] = None

class LocalityResponse(BaseModel):
    id: str
    name: str
    city: str
    state: str
    slug: str

class ItemCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    category_id: str
    description: str = Field(min_length=10, max_length=2000)
    condition_label: str = Field(min_length=2, max_length=50)
    size_or_variant: Optional[str] = Field(default=None, max_length=50)
    total_quantity: int = Field(ge=1, le=1000)
    price_amount: float = Field(ge=0.0)
    price_unit: str = Field(default="day", pattern="^(hour|day|event_period|fixed_period)$")
    pickup_available: bool = True
    delivery_available: bool = False
    locality_id: Optional[str] = "11111111-1111-1111-1111-111111111111"
    public_location_label: str = Field(min_length=3, max_length=150)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = Field(default=[])

class ItemUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=120)
    category_id: Optional[str] = None
    description: Optional[str] = Field(default=None, min_length=10, max_length=2000)
    condition_label: Optional[str] = Field(default=None, min_length=2, max_length=50)
    size_or_variant: Optional[str] = None
    total_quantity: Optional[int] = Field(default=None, ge=1, le=1000)
    price_amount: Optional[float] = Field(default=None, ge=0.0)
    price_unit: Optional[str] = Field(default=None, pattern="^(hour|day|event_period|fixed_period)$")
    pickup_available: Optional[bool] = None
    delivery_available: Optional[bool] = None
    public_location_label: Optional[str] = Field(default=None, min_length=3, max_length=150)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    status: Optional[str] = Field(default=None, pattern="^(active|paused|draft)$")

class ItemResponse(BaseModel):
    id: str
    lender_id: str
    lender_name: str
    lender_verified: bool
    category_id: str
    category_name: str
    title: str
    description: str
    condition_label: str
    size_or_variant: Optional[str] = None
    total_quantity: int
    price_amount: float
    price_unit: str
    currency: str = "INR"
    pickup_available: bool
    delivery_available: bool
    locality_id: str
    locality_name: str
    public_location_label: str
    status: str  # draft, active, paused, rejected, suspended
    images: List[str] = []
    primary_image: str
    created_at: str
    updated_at: str

class PaginatedItemsResponse(BaseModel):
    items: List[ItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


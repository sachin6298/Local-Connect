from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class CreateRentalRequestPayload(BaseModel):
    item_id: str = Field(..., min_length=1)
    rental_start: date
    rental_end: date
    quantity: int = Field(..., ge=1, le=100)
    handover_method: str = Field(default="pickup", pattern="^(pickup|delivery)$")
    tourist_note: Optional[str] = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_dates(self) -> "CreateRentalRequestPayload":
        from datetime import date as d
        today = d.today()
        if self.rental_start < today:
            raise ValueError("Rental start date must be today or in the future.")
        if self.rental_end <= self.rental_start:
            raise ValueError("Rental end date must be after rental start date.")
        return self


class RentalRequestResponse(BaseModel):
    id: str
    tourist_id: str
    lender_id: str
    item_id: str
    item_title: str
    tourist_name: str
    tourist_email: str
    lender_name: str
    quantity: int
    rental_start: str
    rental_end: str
    handover_method: str
    tourist_note: Optional[str]
    rental_subtotal: float
    platform_fee: float
    total_amount: float
    currency: str
    status: str
    created_at: str
    updated_at: str


class UpdateRequestStatusPayload(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=500)

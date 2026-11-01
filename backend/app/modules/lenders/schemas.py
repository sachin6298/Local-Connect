from typing import List, Optional
from pydantic import BaseModel, Field

class LenderOnboardingRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    locality_id: Optional[str] = Field(default="11111111-1111-1111-1111-111111111111")
    public_area_label: str = Field(min_length=3, max_length=150)
    languages: List[str] = Field(default=["Hindi"])

class LenderVerificationSubmission(BaseModel):
    document_paths: List[str] = Field(min_length=1, max_length=5)
    notes: Optional[str] = Field(default=None, max_length=500)

class LenderDecisionRequest(BaseModel):
    decision: str = Field(pattern="^(approved|rejected|suspended)$")
    note: Optional[str] = Field(default=None, max_length=500)

class LenderProfileResponse(BaseModel):
    user_id: str
    display_name: str
    description: Optional[str] = None
    locality_id: Optional[str] = None
    locality_name: Optional[str] = None
    public_area_label: Optional[str] = None
    verification_status: str  # draft, submitted, approved, rejected, suspended
    verification_note: Optional[str] = None
    verification_document_paths: List[str] = []
    languages: List[str] = []
    created_at: str
    updated_at: str

class PublicLenderProfileResponse(BaseModel):
    user_id: str
    display_name: str
    description: Optional[str] = None
    locality_name: Optional[str] = None
    public_area_label: Optional[str] = None
    verification_status: str
    languages: List[str] = []


import hashlib
import hmac
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core.config import settings
from app.modules.users.router import router as users_router

app = FastAPI(title="LocalConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-Razorpay-Signature"],
)

# Mount user profiles and role-specific dashboard router
app.include_router(users_router, prefix="/api/v1")

class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=2500)
    locality: Optional[str] = Field(default=None, max_length=120)

class CreateOrderRequest(BaseModel):
    rental_request_id: str

class VerifyPaymentRequest(BaseModel):
    rental_request_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "localconnect-api", "env": settings.app_env}

@app.post("/api/v1/ai/chat")
async def ai_chat(payload: ChatRequest):
    if not settings.gemini_api_key:
        raise HTTPException(status_code=503, detail="AI assistant is not configured. Add GEMINI_API_KEY to backend environment.")
    try:
        from google import genai
        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = (
            "You are LocalConnect's item-rental assistant. LocalConnect connects tourists "
            "with local lenders for temporary rental of clothing, backpacks, utensils, puja "
            "materials and daily-use/household items. It does not sell goods or book hotels, "
            "taxis or tour guides. Help interpret the user's item need and destination. "
            "Never invent listing availability, lender names, prices, fees or delivery status. "
            "Tell the user that live inventory must be confirmed from the catalogue. "
            f"Destination context: {payload.locality or 'not supplied'}. "
            f"User message: {payload.message}"
        )
        response = client.models.generate_content(model=settings.gemini_model, contents=prompt)
        return {"reply": response.text or "I could not prepare a response. Please browse the item categories."}
    except Exception:
        raise HTTPException(status_code=502, detail="AI service is temporarily unavailable. Please use catalogue search.")

def get_razorpay_client():
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail="Razorpay is not configured. Add test credentials to the backend environment.")
    try:
        import razorpay
        return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
    except ImportError:
        raise HTTPException(status_code=503, detail="Razorpay SDK is not installed.")

@app.post("/api/v1/payments/create-order")
def create_order(payload: CreateOrderRequest):
    raise HTTPException(
        status_code=501,
        detail="Payment order creation requires the authenticated rental repository and server-side quote lookup. Do not pass an amount from the client."
    )

@app.post("/api/v1/payments/verify")
def verify_payment(payload: VerifyPaymentRequest):
    if not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail="Razorpay is not configured.")
    message = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(settings.razorpay_key_secret.encode(), message, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")
    raise HTTPException(status_code=501, detail="Signature helper passed, but database association and idempotent persistence must be completed before payment confirmation.")

@app.post("/api/v1/payments/webhook")
async def payment_webhook(request: Request, x_razorpay_signature: Optional[str] = Header(default=None)):
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status_code=503, detail="Razorpay webhook secret is not configured.")
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing Razorpay webhook signature.")
    raw_body = await request.body()
    expected = hmac.new(settings.razorpay_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")
    raise HTTPException(status_code=501, detail="Webhook signature verified; event persistence and idempotent processing are not yet implemented.")

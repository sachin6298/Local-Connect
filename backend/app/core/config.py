from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "LocalConnect API"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:5173"
    api_v1_prefix: str = "/api/v1"

    # Supabase configuration
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    # JWT secret from Supabase project settings used to verify tokens server-side
    supabase_jwt_secret: str = "localconnect-dev-supabase-jwt-secret-replace-in-prod"

    # Gemini & Razorpay
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    razorpay_webhook_secret: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()


"""Application Configuration"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API Settings
    APP_NAME: str = "Lead Generation API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    # External business search provider
    SEARCH_PROVIDER_API_TOKEN: str = os.getenv("SEARCH_PROVIDER_API_TOKEN", "")
    SEARCH_PROVIDER_ACTOR_ID: str = os.getenv("SEARCH_PROVIDER_ACTOR_ID", "2Mdma1N6Fd0y3QEjR")
    SEARCH_PROVIDER_BASE_URL: str = os.getenv("SEARCH_PROVIDER_BASE_URL", "")
    
    # Google Gemini API (legacy; not used when Crawl4AI is enabled)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "")

    # Crawl4AI configuration
    CRAWL4AI_MAX_PAGES: int = int(os.getenv("CRAWL4AI_MAX_PAGES", "6"))
    
    # HubSpot API
    HUBSPOT_API_KEY: str = os.getenv("HUBSPOT_API_KEY", "")
    HUBSPOT_OAUTH_CLIENT_ID: str = os.getenv("HUBSPOT_OAUTH_CLIENT_ID", "")
    HUBSPOT_OAUTH_CLIENT_SECRET: str = os.getenv("HUBSPOT_OAUTH_CLIENT_SECRET", "")
    HUBSPOT_REDIRECT_URI: str = os.getenv("HUBSPOT_REDIRECT_URI", "http://localhost:8000/api/v1/hubspot/callback")
    
    # Search Settings
    SEARCH_RADIUS: int = 5000  # meters
    MAX_RESULTS: int = 50
    
    # Server Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # CORS
    CORS_ALLOWED_ORIGINS: str = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
    
    # Streamlit Configuration
    STREAMLIT_SERVER_PORT: int = int(os.getenv("STREAMLIT_SERVER_PORT", "8501"))
    STREAMLIT_SERVER_ADDRESS: str = os.getenv("STREAMLIT_SERVER_ADDRESS", "localhost")
    # IP whitelist (comma-separated) for bypassing rate limits, e.g. "127.0.0.1,::1"
    IP_WHITELIST: str = os.getenv("IP_WHITELIST", "")
    # Admin bypass token: if provided in header 'x-admin-bypass-token' will bypass limits
    ADMIN_BYPASS_TOKEN: str = os.getenv("ADMIN_BYPASS_TOKEN", "")
    # Zoho CRM
    ZOHO_ACCESS_TOKEN: str = os.getenv("ZOHO_ACCESS_TOKEN", "")
    ZOHO_BASE_URL: str = os.getenv("ZOHO_BASE_URL", "https://www.zohoapis.com/crm/v2")

    # Salesforce
    SALESFORCE_ACCESS_TOKEN: str = os.getenv("SALESFORCE_ACCESS_TOKEN", "")
    SALESFORCE_INSTANCE_URL: str = os.getenv("SALESFORCE_INSTANCE_URL", "")
    SALESFORCE_API_VERSION: str = os.getenv("SALESFORCE_API_VERSION", "52.0")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./leadgen.sqlite")

    # Auth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRES_MINUTES: int = int(os.getenv("JWT_EXPIRES_MINUTES", "10080"))
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_SUCCESS_URL: str = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3000?checkout=success")
    STRIPE_CANCEL_URL: str = os.getenv("STRIPE_CANCEL_URL", "http://localhost:3000?checkout=cancel")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


settings = Settings()

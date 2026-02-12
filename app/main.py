"""Main FastAPI Application"""
import asyncio
import logging
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import init_db
from app.routes import businesses, hubspot, zoho, salesforce, enrichment, auth, billing, agent

# Configure logging early so app/service loggers emit output
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# Ensure subprocess support on Windows for Playwright/Crawl4AI
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
allowed_origins = [origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(businesses.router, prefix="/api/v1", tags=["businesses"])
app.include_router(hubspot.router, prefix="/api/v1", tags=["hubspot"])
app.include_router(zoho.router, prefix="/api/v1", tags=["zoho"])
app.include_router(salesforce.router, prefix="/api/v1", tags=["salesforce"])
app.include_router(enrichment.router, tags=["enrichment"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(billing.router, prefix="/api/v1", tags=["billing"])
app.include_router(agent.router, tags=["agent"])


@app.on_event("startup")
def on_startup():
    """Initialize database tables."""
    init_db()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": f"Welcome to {settings.APP_NAME} API"}

"""Auth routes for Google SSO."""
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from app.config import settings
from app.db import models
from app.db.session import get_db
from app.utils.auth import TOKEN_COOKIE_NAME, create_access_token, get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google ID token from GIS")


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str] = None
    credits: int


class AuthResponse(BaseModel):
    user: UserResponse


@router.post("/auth/google", response_model=AuthResponse)
def login_with_google(payload: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    """Verify Google ID token and create session."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")

    try:
        id_info = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        logger.warning("Invalid Google token: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_sub = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name") or email or "User"
    picture = id_info.get("picture")

    if not google_sub or not email:
        raise HTTPException(status_code=400, detail="Missing Google account data")

    user = db.query(models.User).filter(models.User.google_sub == google_sub).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        user = models.User(
            google_sub=google_sub,
            email=email,
            name=name,
            picture=picture,
            credits=0,
        )
        db.add(user)
    else:
        user.google_sub = google_sub
        user.email = email
        user.name = name
        user.picture = picture
        user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=google_sub)
    response.set_cookie(
        key=TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.JWT_EXPIRES_MINUTES * 60,
    )

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "credits": user.credits,
        }
    }


@router.get("/auth/me", response_model=AuthResponse)
def get_me(user: models.User = Depends(get_current_user)):
    """Return the current authenticated user."""
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "credits": user.credits,
        }
    }


@router.post("/auth/logout")
def logout(response: Response):
    """Clear auth session cookie."""
    response.delete_cookie(key=TOKEN_COOKIE_NAME)
    return {"status": "ok"}

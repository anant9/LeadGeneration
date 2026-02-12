"""Auth utilities for JWT and current user handling."""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Cookie, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.db import models
from app.db.session import get_db

TOKEN_COOKIE_NAME = "leadgen_session"


def create_access_token(subject: str) -> str:
    """Create a signed JWT for the given subject."""
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRES_MINUTES)
    payload = {
        "sub": subject,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Decode JWT and return subject."""
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    subject = payload.get("sub")
    if not subject:
        raise JWTError("Missing subject")
    return subject


def _get_token_from_header(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def get_current_user(
    db: Session = Depends(get_db),
    session_token: Optional[str] = Cookie(default=None, alias=TOKEN_COOKIE_NAME),
    authorization: Optional[str] = Header(default=None),
) -> models.User:
    """Require an authenticated user."""
    token = session_token or _get_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        subject = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.query(models.User).filter(models.User.google_sub == subject).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_optional_user(
    db: Session = Depends(get_db),
    session_token: Optional[str] = Cookie(default=None, alias=TOKEN_COOKIE_NAME),
    authorization: Optional[str] = Header(default=None),
) -> Optional[models.User]:
    """Return user if authenticated, otherwise None."""
    token = session_token or _get_token_from_header(authorization)
    if not token:
        return None
    try:
        subject = decode_access_token(token)
    except JWTError:
        return None

    return db.query(models.User).filter(models.User.google_sub == subject).first()

"""Simple IP-based daily rate limiter backed by SQLite."""
import sqlite3
import os
from datetime import datetime
from fastapi import Request, HTTPException
from app.config import settings
from app.utils.auth import TOKEN_COOKIE_NAME, decode_access_token
from app.db.session import SessionLocal
from app.db import models


# DB placed at repo root
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ip_rate_limiter.sqlite")


def _get_conn():
    db_file = os.path.abspath(DB_PATH)
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    conn = sqlite3.connect(db_file, timeout=5)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS ip_limits (
            ip TEXT NOT NULL,
            date TEXT NOT NULL,
            count INTEGER NOT NULL,
            PRIMARY KEY(ip, date)
        )"""
    )
    conn.commit()
    return conn


def _today():
    return datetime.utcnow().date().isoformat()


def increment_or_check(ip: str, limit: int = 3) -> int:
    """Increment count for (ip, today) and return current count after increment.

    Raises HTTPException(429) if already at or above limit.
    """
    if not ip:
        # treat missing ip as part of same bucket
        ip = "unknown"

    conn = _get_conn()
    cur = conn.cursor()
    today = _today()
    cur.execute("SELECT count FROM ip_limits WHERE ip = ? AND date = ?", (ip, today))
    row = cur.fetchone()
    if row:
        count = int(row[0])
        if count >= limit:
            conn.close()
            raise HTTPException(status_code=429, detail=f"Daily anonymous query limit reached ({limit})")
        count += 1
        cur.execute("UPDATE ip_limits SET count = ? WHERE ip = ? AND date = ?", (count, ip, today))
    else:
        count = 1
        cur.execute("INSERT INTO ip_limits(ip, date, count) VALUES(?, ?, ?)", (ip, today, count))

    conn.commit()
    conn.close()
    return count


async def enforce_ip_daily_limit(request: Request):
    """FastAPI dependency to enforce a daily per-IP limit of anonymous searches.

    This will raise HTTPException(429) when the limit is reached.
    """
    # Authenticated users with credits are not subject to anonymous limits
    token = request.cookies.get(TOKEN_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]

    if token:
        try:
            subject = decode_access_token(token)
        except Exception:
            subject = None

        if subject:
            db = SessionLocal()
            try:
                user = db.query(models.User).filter(models.User.google_sub == subject).first()
                if user and user.credits > 0:
                    return
            finally:
                db.close()

    # Admin bypass via header
    admin_token = request.headers.get("x-admin-bypass-token")
    if admin_token and settings.ADMIN_BYPASS_TOKEN and admin_token == settings.ADMIN_BYPASS_TOKEN:
        return

    # Prefer X-Forwarded-For (if behind proxy), else client.host
    xff = request.headers.get("x-forwarded-for")
    if xff:
        ip = xff.split(",")[0].strip()
    else:
        client = request.client
        ip = client.host if client else "unknown"

    # Whitelist support (comma-separated in settings)
    whitelist_raw = settings.IP_WHITELIST or ""
    whitelist = [p.strip() for p in whitelist_raw.split(",") if p.strip()]
    if ip in whitelist:
        return

    # Increment and allow up to 3 per day
    increment_or_check(ip, limit=3)

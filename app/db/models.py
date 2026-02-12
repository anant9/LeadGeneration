"""Database models for auth and billing."""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class User(Base):
    """User account stored by Google subject."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(String(512), nullable=True)
    credits = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    checkouts = relationship("CreditCheckout", back_populates="user")


class CreditCheckout(Base):
    """Stripe Checkout session records for credit purchases."""

    __tablename__ = "credit_checkouts"
    __table_args__ = (UniqueConstraint("stripe_session_id", name="uq_checkout_session"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_session_id = Column(String(255), nullable=False)
    pack_id = Column(String(64), nullable=False)
    credits = Column(Integer, nullable=False)
    amount_cents = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="created")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="checkouts")

"""Billing routes for Stripe credit purchases."""
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import stripe
from app.config import settings
from app.db import models
from app.db.session import get_db
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

CREDIT_PACKS = {
    "starter": {"credits": 100, "amount_cents": 500},
    "growth": {"credits": 500, "amount_cents": 2000},
    "scale": {"credits": 1000, "amount_cents": 3500},
}


class CheckoutRequest(BaseModel):
    pack_id: str = Field(..., description="Credit pack id")


class CheckoutResponse(BaseModel):
    url: str


class CreditsResponse(BaseModel):
    credits: int


@router.get("/billing/credits", response_model=CreditsResponse)
def get_credits(user: models.User = Depends(get_current_user)):
    """Return current credit balance."""
    return {"credits": user.credits}


@router.post("/billing/checkout", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Create a Stripe Checkout session to purchase credits."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY not configured")

    pack = CREDIT_PACKS.get(payload.pack_id)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid credit pack")

    session = stripe.checkout.Session.create(
        mode="payment",
        success_url=settings.STRIPE_SUCCESS_URL,
        cancel_url=settings.STRIPE_CANCEL_URL,
        line_items=[
            {
                "quantity": 1,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": pack["amount_cents"],
                    "product_data": {
                        "name": f"Lead Gen Credits ({pack['credits']})",
                    },
                },
            }
        ],
        metadata={
            "user_id": str(user.id),
            "credits": str(pack["credits"]),
            "pack_id": payload.pack_id,
        },
    )

    checkout = models.CreditCheckout(
        user_id=user.id,
        stripe_session_id=session.id,
        pack_id=payload.pack_id,
        credits=pack["credits"],
        amount_cents=pack["amount_cents"],
        status="created",
    )
    db.add(checkout)
    db.commit()

    return {"url": session.url}


@router.post("/billing/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events."""
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="STRIPE_WEBHOOK_SECRET not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session.get("id")
        payment_status = session.get("payment_status")
        metadata = session.get("metadata") or {}

        if payment_status == "paid" and session_id:
            checkout = (
                db.query(models.CreditCheckout)
                .filter(models.CreditCheckout.stripe_session_id == session_id)
                .first()
            )

            if checkout and checkout.status != "completed":
                user = db.query(models.User).filter(models.User.id == checkout.user_id).first()
                if user:
                    user.credits += checkout.credits
                checkout.status = "completed"
                checkout.completed_at = datetime.utcnow()
                db.commit()
            elif not checkout:
                user_id = int(metadata.get("user_id", "0") or 0)
                credits = int(metadata.get("credits", "0") or 0)
                pack_id = metadata.get("pack_id", "unknown")
                user = db.query(models.User).filter(models.User.id == user_id).first()
                if user and credits > 0:
                    user.credits += credits
                    new_checkout = models.CreditCheckout(
                        user_id=user.id,
                        stripe_session_id=session_id,
                        pack_id=pack_id,
                        credits=credits,
                        amount_cents=0,
                        status="completed",
                        completed_at=datetime.utcnow(),
                    )
                    db.add(new_checkout)
                    db.commit()

    return {"status": "ok"}

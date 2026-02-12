"""Zoho routes mirroring HubSpot endpoints (minimal)"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.services.zoho_service import ZohoService
from app.schemas.hubspot import (
    HubSpotLeadCreate,
    HubSpotBatchLeadsCreate,
    HubSpotDealCreate,
    HubSpotConnectionRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/zoho", tags=["zoho"])

_zoho_service = None


def get_zoho_service() -> ZohoService:
    global _zoho_service
    if _zoho_service is None:
        _zoho_service = ZohoService()
    return _zoho_service


@router.get("/status")
async def status(service: ZohoService = Depends(get_zoho_service)):
    try:
        return service.verify_connection()
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads")
async def create_lead(lead: HubSpotLeadCreate, service: ZohoService = Depends(get_zoho_service)):
    try:
        return service.create_lead(lead.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/batch")
async def create_batch(batch: HubSpotBatchLeadsCreate, service: ZohoService = Depends(get_zoho_service)):
    try:
        leads = [l.model_dump() for l in batch.leads]
        return service.batch_create_leads(leads)
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/upsert")
async def upsert_lead(lead: HubSpotLeadCreate, service: ZohoService = Depends(get_zoho_service)):
    try:
        return service.create_or_update_lead(lead.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deals")
async def create_deal(deal: HubSpotDealCreate, service: ZohoService = Depends(get_zoho_service)):
    try:
        return service.create_deal(deal.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

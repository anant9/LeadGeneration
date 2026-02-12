"""Salesforce routes mirroring HubSpot endpoints (minimal)"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.services.salesforce_service import SalesforceService
from app.schemas.hubspot import (
    HubSpotLeadCreate,
    HubSpotBatchLeadsCreate,
    HubSpotDealCreate,
    HubSpotConnectionRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/salesforce", tags=["salesforce"])

_sf_service = None


def get_sf_service() -> SalesforceService:
    global _sf_service
    if _sf_service is None:
        _sf_service = SalesforceService()
    return _sf_service


@router.get("/status")
async def status(service: SalesforceService = Depends(get_sf_service)):
    try:
        return service.verify_connection()
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads")
async def create_lead(lead: HubSpotLeadCreate, service: SalesforceService = Depends(get_sf_service)):
    try:
        return service.create_lead(lead.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/batch")
async def create_batch(batch: HubSpotBatchLeadsCreate, service: SalesforceService = Depends(get_sf_service)):
    try:
        leads = [l.model_dump() for l in batch.leads]
        return service.batch_create_leads(leads)
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/upsert")
async def upsert_lead(lead: HubSpotLeadCreate, service: SalesforceService = Depends(get_sf_service)):
    try:
        return service.create_or_update_lead(lead.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deals")
async def create_deal(deal: HubSpotDealCreate, service: SalesforceService = Depends(get_sf_service)):
    try:
        return service.create_deal(deal.model_dump())
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))

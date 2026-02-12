"""HubSpot API Routes"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.services.hubspot_service import HubSpotService
from app.schemas.hubspot import (
    HubSpotLeadCreate,
    HubSpotBatchLeadsCreate,
    HubSpotDealCreate,
    HubSpotConnectionResponse,
    HubSpotLeadResponse,
    HubSpotBatchLeadsResponse,
    HubSpotDealResponse,
    HubSpotConnectionRequest,
    GoogleBusinessToHubSpot
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/hubspot",
    tags=["hubspot"]
)

# Store active HubSpot service instances
_hubspot_service = None


def get_hubspot_service() -> HubSpotService:
    """Dependency to get HubSpot service instance"""
    global _hubspot_service
    if _hubspot_service is None:
        _hubspot_service = HubSpotService()
    return _hubspot_service


@router.get("/status", response_model=HubSpotConnectionResponse)
async def check_connection(service: HubSpotService = Depends(get_hubspot_service)):
    """Check HubSpot API connection status
    
    Returns:
        HubSpotConnectionResponse with connection status
    """
    try:
        result = service.verify_connection()
        if result.get("connected"):
            return HubSpotConnectionResponse(
                connected=True,
                message=result.get("message", "Connected to HubSpot"),
                error=None
            )
        else:
            return HubSpotConnectionResponse(
                connected=False,
                message="Failed to connect to HubSpot",
                error=result.get("message")
            )
    except Exception as e:
        logger.error(f"Connection check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads", response_model=HubSpotLeadResponse)
async def create_lead(
    lead: HubSpotLeadCreate,
    service: HubSpotService = Depends(get_hubspot_service)
):
    """Create a new contact/lead in HubSpot
    
    Args:
        lead: HubSpotLeadCreate object with contact information
        service: HubSpot service instance
    
    Returns:
        HubSpotLeadResponse with created contact ID
    """
    try:
        result = service.create_lead(lead.model_dump())
        if result.get("success"):
            return HubSpotLeadResponse(
                success=True,
                contact_id=result.get("contact_id"),
                message="Contact created successfully",
                data=result.get("data")
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to create contact")
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/batch", response_model=HubSpotBatchLeadsResponse)
async def create_batch_leads(
    batch: HubSpotBatchLeadsCreate,
    service: HubSpotService = Depends(get_hubspot_service)
):
    """Create multiple contacts/leads in HubSpot
    
    Args:
        batch: HubSpotBatchLeadsCreate with list of leads
        service: HubSpot service instance
    
    Returns:
        HubSpotBatchLeadsResponse with creation results
    """
    try:
        lead_dicts = [lead.model_dump() for lead in batch.leads]
        result = service.batch_create_leads(lead_dicts)
        
        if result.get("success"):
            return HubSpotBatchLeadsResponse(
                success=True,
                total=result.get("total", len(batch.leads)),
                created=result.get("total", len(batch.leads)),
                message=f"Successfully created {len(batch.leads)} contacts",
                data=result.get("data")
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to create contacts")
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating batch leads: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/upsert", response_model=HubSpotLeadResponse)
async def upsert_lead(
    lead: HubSpotLeadCreate,
    service: HubSpotService = Depends(get_hubspot_service)
):
    """Create or update a contact in HubSpot
    
    Args:
        lead: HubSpotLeadCreate object with contact information
        service: HubSpot service instance
    
    Returns:
        HubSpotLeadResponse with upserted contact info
    """
    try:
        result = service.create_or_update_lead(lead.model_dump())
        if result.get("success"):
            return HubSpotLeadResponse(
                success=True,
                message="Contact created or updated successfully",
                data=result.get("data")
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to upsert contact")
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upserting lead: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deals", response_model=HubSpotDealResponse)
async def create_deal(
    deal: HubSpotDealCreate,
    service: HubSpotService = Depends(get_hubspot_service)
):
    """Create a deal in HubSpot
    
    Args:
        deal: HubSpotDealCreate object with deal information
        service: HubSpot service instance
    
    Returns:
        HubSpotDealResponse with created deal ID
    """
    try:
        result = service.create_deal(deal.model_dump())
        if result.get("success"):
            return HubSpotDealResponse(
                success=True,
                deal_id=result.get("deal_id"),
                message="Deal created successfully",
                data=result.get("data")
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to create deal")
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/contacts/search")
async def search_contacts(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=100),
    service: HubSpotService = Depends(get_hubspot_service)
):
    """Search for contacts in HubSpot
    
    Args:
        query: Search query string
        limit: Maximum number of results
        service: HubSpot service instance
    
    Returns:
        List of matching contacts
    """
    try:
        result = service.get_contacts(limit=limit)
        if result.get("success"):
            # Simple filtering on client side
            contacts = result.get("data", {}).get("results", [])
            filtered = [
                c for c in contacts
                if query.lower() in str(c).lower()
            ][:limit]
            
            return {
                "success": True,
                "total": len(filtered),
                "contacts": filtered
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to search contacts")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching contacts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/convert/google-to-hubspot")
async def convert_google_to_hubspot(
    business: GoogleBusinessToHubSpot
):
    """Convert Google business result to HubSpot lead format
    
    Args:
        business: GoogleBusinessToHubSpot with business information
    
    Returns:
        HubSpotLeadCreate ready for HubSpot API
    """
    try:
        # Extract email from website if possible, otherwise create placeholder
        email = f"{business.name.lower().replace(' ', '.')}@business.local"
        
        lead = HubSpotLeadCreate(
            email=email,
            firstname=business.name.split()[0] if business.name else "Business",
            lastname=" ".join(business.name.split()[1:]) if len(business.name.split()) > 1 else business.name,
            phone=business.phone,
            company=business.name,
            website=business.website,
            address=business.address,
            business_type=business.business_type,
            rating=business.rating,
            review_count=business.review_count,
            latitude=business.latitude,
            longitude=business.longitude
        )
        
        return {
            "success": True,
            "lead": lead.model_dump(),
            "message": "Successfully converted Google business to HubSpot lead format"
        }
    except Exception as e:
        logger.error(f"Error converting business: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/connection")
async def set_connection(connection: HubSpotConnectionRequest):
    """Set/update HubSpot connection credentials
    
    Args:
        connection: HubSpotConnectionRequest with API credentials
    
    Returns:
        Connection verification result
    """
    global _hubspot_service
    try:
        # Initialize new service with provided token
        _hubspot_service = HubSpotService(access_token=connection.access_token)
        
        # Verify connection
        result = _hubspot_service.verify_connection()
        
        if result.get("connected"):
            return HubSpotConnectionResponse(
                connected=True,
                message="Successfully connected to HubSpot with provided credentials",
                portal_id=connection.portal_id
            )
        else:
            raise HTTPException(
                status_code=401,
                detail="Invalid HubSpot credentials or API key"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting connection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

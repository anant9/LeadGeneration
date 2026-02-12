"""
Enrichment Routes - API endpoints for enriching business data with contact information
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.contact_extractor_service import (
    ContactExtractorService,
    ContactExtractionResult,
    Contact
)
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/enrichment", tags=["enrichment"])

# Initialize services
contact_extractor = None

# Initialize Crawl4AI extractor (LLM enrichment optional)
contact_extractor = ContactExtractorService(
    max_pages=settings.CRAWL4AI_MAX_PAGES,
    gemini_api_key=settings.GEMINI_API_KEY or None,
    gemini_model=settings.GEMINI_MODEL or None,
)


# Request/Response Models
class EnrichmentRequest(BaseModel):
    """Request to enrich a single business"""
    name: str
    website: str
    address: Optional[str] = None


class EnrichmentResponse(BaseModel):
    """Response with enriched business data"""
    name: str
    website: str
    contacts: List[Contact]
    confidence: float
    scraped_content_length: int
    status: str


class BatchEnrichmentRequest(BaseModel):
    """Request to enrich multiple businesses"""
    businesses: List[EnrichmentRequest]


class BatchEnrichmentResponse(BaseModel):
    """Response with multiple enriched businesses"""
    total: int
    successful: int
    failed: int
    results: List[EnrichmentResponse]


@router.post("/enrich", response_model=EnrichmentResponse)
def enrich_business(request: EnrichmentRequest):
    """
    Enrich a single business record with contact information
    
    1. Scrapes the business website
    2. Extracts contacts using Gemini LLM
    3. Returns enriched data with contacts
    
    Args:
        request: Business information to enrich
        
    Returns:
        EnrichmentResponse with extracted contacts
    """
    try:
        logger.info(f"Extracting contacts via Crawl4AI: business={request.name}")
        result = contact_extractor.extract_contacts(
            business_name=request.name,
            website_url=request.website,
            address=request.address
        )

        logger.info(
            f"Enrichment completed: business={request.name} contacts={len(result.contacts)} confidence={result.confidence}"
        )
        
        return EnrichmentResponse(
            name=result.business_name,
            website=result.website,
            contacts=result.contacts,
            confidence=result.confidence,
            scraped_content_length=0,
            status="success" if result.contacts else "no_contacts_found"
        )
        
    except Exception as e:
        logger.error(f"Error enriching business {request.name}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Enrichment failed: {str(e)}"
        )


@router.post("/batch-enrich", response_model=BatchEnrichmentResponse)
def batch_enrich_businesses(request: BatchEnrichmentRequest):
    """
    Enrich multiple business records with contact information
    
    Args:
        request: Multiple businesses to enrich
        
    Returns:
        BatchEnrichmentResponse with results for all businesses
    """
    results = []
    successful = 0
    failed = 0
    
    for business_req in request.businesses:
        try:
            # Extract contacts
            extraction_result = contact_extractor.extract_contacts(
                business_name=business_req.name,
                website_url=business_req.website,
                address=business_req.address
            )
            
            response = EnrichmentResponse(
                name=extraction_result.business_name,
                website=extraction_result.website,
                contacts=extraction_result.contacts,
                confidence=extraction_result.confidence,
                scraped_content_length=0,
                status="success" if extraction_result.contacts else "no_contacts_found"
            )
            
            results.append(response)
            successful += 1
            
        except Exception as e:
            logger.error(f"Error enriching {business_req.name}: {str(e)}")
            results.append(
                EnrichmentResponse(
                    name=business_req.name,
                    website=business_req.website,
                    contacts=[],
                    confidence=0.0,
                    scraped_content_length=0,
                    status="error"
                )
            )
            failed += 1
    
    return BatchEnrichmentResponse(
        total=len(request.businesses),
        successful=successful,
        failed=failed,
        results=results
    )


@router.get("/health")
def enrichment_health():
    """Check if enrichment service is available"""
    resp = {
        "status": "available" if contact_extractor else "not_configured",
        "crawl4ai_configured": True,
        "service": "contact_enrichment"
    }
    # If contact_extractor exists, include config info
    if contact_extractor:
        try:
            resp["crawl4ai_max_pages"] = getattr(contact_extractor, 'max_pages', None)
        except Exception:
            resp["crawl4ai_max_pages"] = None

    return resp

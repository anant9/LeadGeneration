"""Business Routes"""
import logging
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from typing import Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.schemas.business import BusinessSearch, SearchResultsResponse, BusinessResponse
from app.services.google_maps_service import GoogleMapsService
from app.utils.auth import get_optional_user
from app.db.session import get_db
from app.db import models

router = APIRouter()
logger = logging.getLogger(__name__)


def _is_paid_user(user: Optional[models.User]) -> bool:
    return bool(user and user.credits > 0)


def _resolve_max_results(user: Optional[models.User], max_results: Optional[int]) -> int:
    if _is_paid_user(user):
        return min(max_results or settings.MAX_RESULTS, settings.MAX_RESULTS)
    return min(max_results or 5, 5)


@router.post("/search", response_model=SearchResultsResponse)
async def search_businesses(
    search_query: BusinessSearch,
    user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Search for businesses near a location
    
    Args:
        search_query: Search parameters including latitude, longitude, and business type
        
    Returns:
        List of nearby businesses
    """
    try:
        search_query.max_results = _resolve_max_results(user, search_query.max_results)

        # Initialize Google Maps service
        maps_service = GoogleMapsService()
        
        # Search nearby businesses
        businesses = maps_service.search_nearby_businesses(
            latitude=search_query.latitude,
            longitude=search_query.longitude,
            business_type=search_query.business_type,
            radius=search_query.radius,
            max_results=search_query.max_results,
        )
        
        # Convert to response format
        results = [BusinessResponse(**business.to_dict()) for business in businesses]

        if _is_paid_user(user):
            user.credits -= 1
            db.commit()
        
        return SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={
                "latitude": search_query.latitude,
                "longitude": search_query.longitude,
                "business_type": search_query.business_type,
                "radius": search_query.radius,
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error searching businesses: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search/by-address", response_model=SearchResultsResponse)
async def search_by_address(
    address: str = Query(..., description="Address to search from"),
    business_type: str = Query(..., description="Type of business to search for"),
    radius: Optional[int] = Query(5000, description="Search radius in meters"),
    max_results: Optional[int] = Query(50, description="Maximum number of results"),
    user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Search for businesses near an address
    
    Args:
        address: Address to search from
        business_type: Type of business to search for
        radius: Search radius in meters
        max_results: Maximum number of results
        
    Returns:
        List of nearby businesses
    """
    try:
        maps_service = GoogleMapsService()
        
        # Geocode the address
        coordinates = maps_service.geocode_address(address)
        if not coordinates:
            raise HTTPException(status_code=404, detail="Address not found")
        
        latitude, longitude = coordinates
        
        max_results = _resolve_max_results(user, max_results)

        # Search nearby businesses
        businesses = maps_service.search_nearby_businesses(
            latitude=latitude,
            longitude=longitude,
            business_type=business_type,
            radius=radius,
            max_results=max_results,
        )
        
        results = [BusinessResponse(**business.to_dict()) for business in businesses]

        if _is_paid_user(user):
            user.credits -= 1
            db.commit()
        
        return SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={
                "address": address,
                "business_type": business_type,
                "radius": radius,
                "latitude": latitude,
                "longitude": longitude,
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching by address: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search/natural", response_model=SearchResultsResponse)
async def search_natural_language(
    query: str = Query(..., description="Natural language search query (e.g., 'cafe in new york city')"),
    max_results: Optional[int] = Query(50, description="Maximum number of results"),
    user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Search for businesses using natural language query
    
    This endpoint accepts free-form text queries like:
    - "cafe in new york city"
    - "pizza restaurants near times square"
    - "best restaurants in san francisco"
    
    Args:
        query: Natural language search query
        max_results: Maximum number of results
        
    Returns:
        List of businesses matching the query
    """
    try:
        maps_service = GoogleMapsService()
        
        max_results = _resolve_max_results(user, max_results)

        # Text search
        businesses = maps_service.text_search_businesses(
            query=query,
            max_results=max_results,
        )
        
        results = [BusinessResponse(**business.to_dict()) for business in businesses]

        if _is_paid_user(user):
            user.credits -= 1
            db.commit()
        
        return SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={"query": query, "type": "natural_language"}
        )
        
    except Exception as e:
        logger.error(f"Error in natural language search: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

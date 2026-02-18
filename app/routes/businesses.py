"""Business Routes"""
import io
import json
import logging
from fastapi import APIRouter, HTTPException, Query, Depends, Body, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Optional, Any, Dict, List
from sqlalchemy.orm import Session
from app.config import settings
from app.schemas.business import (
    BusinessSearch,
    SearchResultsResponse,
    BusinessResponse,
    NaturalLanguageBusinessSearch,
)
from app.services.google_maps_service import GoogleMapsService
from app.services.business_search_provider_service import BusinessSearchProviderService
from app.services.natural_language_search_service import (
    parse_natural_language_query,
    is_website_input,
    suggest_customer_queries_from_website,
)
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
    return min(max_results or settings.FREE_USER_MAX_RESULTS, settings.FREE_USER_MAX_RESULTS)


def _log_response_debug(route_name: str, response_obj: SearchResultsResponse) -> None:
    if not settings.DEBUG:
        return
    if not logger.isEnabledFor(logging.DEBUG):
        return

    if hasattr(response_obj, "model_dump"):
        payload = response_obj.model_dump()
    else:
        payload = response_obj.dict()

    logger.debug("Final API response for %s: %s", route_name, payload)


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
        
        response_payload = SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={
                "latitude": search_query.latitude,
                "longitude": search_query.longitude,
                "business_type": search_query.business_type,
                "radius": search_query.radius,
            }
        )
        _log_response_debug("/search", response_payload)
        return response_payload
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
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
        
        response_payload = SearchResultsResponse(
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
        _log_response_debug("/search/by-address", response_payload)
        return response_payload
        
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
        
        response_payload = SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={"query": query, "type": "natural_language"}
        )
        _log_response_debug("/search/natural", response_payload)
        return response_payload
        
    except Exception as e:
        logger.error(f"Error in natural language search: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/search/business", response_model=SearchResultsResponse)
async def search_businesses_external(
    search_query: NaturalLanguageBusinessSearch,
    user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Search for businesses using natural language query

    If the query is a website URL, this endpoint reads website content and
    returns 5 suggested natural-language queries to help find potential
    customers for that business.
    """
    try:
        logger.info("/search/business request received")
        logger.debug("Search query: %s", search_query.query)

        if is_website_input(search_query.query):
            logger.info("Website input detected for /search/business")
            website_suggestions = suggest_customer_queries_from_website(search_query.query)
            response_payload = SearchResultsResponse(
                total_results=0,
                results=[],
                query={
                    "query": search_query.query,
                    "type": "website_query_suggestions",
                    "website_url": website_suggestions.get("websiteUrl"),
                    "language": website_suggestions.get("language", "en"),
                    "suggested_queries": website_suggestions.get("suggestedQueries", []),
                },
            )
            _log_response_debug("/search/business", response_payload)
            return response_payload

        max_results = _resolve_max_results(user, None)
        parsed = parse_natural_language_query(search_query.query)
        logger.info(
            "Parsed query -> searchItem=%s, location=%s, language=%s",
            parsed.get("searchItem"),
            parsed.get("location"),
            parsed.get("language"),
        )
        payload = {
            "language": parsed.get("language", "en"),
            "locationQuery": parsed["location"],
            "maxCrawledPlacesPerSearch": max_results,
            "searchStringsArray": [parsed["searchItem"]],
            "skipClosedPlaces": False,
        }
        logger.debug("Provider payload: %s", payload)

        service = BusinessSearchProviderService()
        items = service.run_search(payload)
        logger.info("Provider returned %s items", len(items))
        if items:
            logger.debug("Provider item keys: %s", list(items[0].keys()))
        if _is_provider_error(items):
            error_item = items[0]
            error_code = error_item.get("error")
            error_desc = error_item.get("errorDescription") or "Search provider error"
            if error_code == "no_search_results":
                logger.info("Provider returned no results; responding with empty result set")
                response_payload = SearchResultsResponse(
                    total_results=0,
                    results=[],
                    query={
                        "query": search_query.query,
                        "type": "natural_language",
                        "language": parsed.get("language", "en"),
                    },
                )
                _log_response_debug("/search/business", response_payload)
                return response_payload
            logger.error("Search provider error: %s - %s", error_code, error_desc)
            raise HTTPException(status_code=502, detail="Search provider error")

        results = [_map_provider_item(item) for item in items]
        empty_results = sum(1 for result in results if not result.name and not result.place_id)
        if empty_results:
            logger.warning("Mapped %s empty results", empty_results)

        if _is_paid_user(user):
            user.credits -= 1
            db.commit()

        response_payload = SearchResultsResponse(
            total_results=len(results),
            results=results,
            query={
                "query": search_query.query,
                "type": "natural_language",
                "language": parsed.get("language", "en"),
            },
        )
        _log_response_debug("/search/business", response_payload)
        return response_payload

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching businesses: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/search/business/import", response_model=SearchResultsResponse)
async def import_provider_businesses(
    provider_payload: Any = Body(..., description="Raw JSON returned by provider API"),
):
    """
    Import raw provider dataset response and convert it to /search/business response format.

    Supported payload shapes:
    - Direct list of items (common provider dataset items response)
    - Object containing one of: items, data, results
    """
    try:
        return _build_import_response(provider_payload, route_name="/search/business/import")
    except ValueError as e:
        logger.error("Validation error in provider import: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error importing provider payload: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/search/business/import/upload")
async def import_provider_businesses_upload(
    file: UploadFile = File(..., description="Provider JSON export file"),
):
    """
    Upload provider JSON file and download converted /search/business formatted JSON.
    """
    try:
        filename = (file.filename or "").lower()
        if filename and not filename.endswith(".json"):
            raise HTTPException(status_code=400, detail="Please upload a .json file")

        content = await file.read()
        if not content:
            raise ValueError("Uploaded file is empty")

        try:
            provider_payload = json.loads(content.decode("utf-8"))
        except Exception as parse_error:
            raise ValueError("Uploaded file is not valid JSON") from parse_error

        response_payload = _build_import_response(
            provider_payload,
            route_name="/search/business/import/upload",
        )
        response_json = _response_payload_to_json(response_payload)

        return StreamingResponse(
            io.BytesIO(response_json.encode("utf-8")),
            media_type="application/json",
            headers={
                "Content-Disposition": "attachment; filename=converted_businesses.json"
            },
        )
    except ValueError as e:
        logger.error("Validation error in provider upload import: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error importing provider upload: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


def _build_import_response(provider_payload: Any, route_name: str) -> SearchResultsResponse:
    items, query_text = _extract_provider_items_and_query(provider_payload)

    if _is_provider_error(items):
        error_item = items[0]
        error_code = error_item.get("error")
        error_desc = error_item.get("errorDescription") or "Search provider error"
        if error_code == "no_search_results":
            response_payload = SearchResultsResponse(
                total_results=0,
                results=[],
                query={"query": query_text, "type": "natural_language"},
            )
            _log_response_debug(route_name, response_payload)
            return response_payload
        logger.error("Provider error: %s - %s", error_code, error_desc)
        raise HTTPException(status_code=400, detail="Invalid provider payload")

    results = [_map_provider_item(item) for item in items]
    response_payload = SearchResultsResponse(
        total_results=len(results),
        results=results,
        query={"query": query_text, "type": "natural_language"},
    )
    _log_response_debug(route_name, response_payload)
    return response_payload


def _response_payload_to_json(response_payload: SearchResultsResponse) -> str:
    if hasattr(response_payload, "model_dump"):
        payload = response_payload.model_dump()
    else:
        payload = response_payload.dict()
    return json.dumps(payload, ensure_ascii=False, indent=2)


def _extract_provider_items_and_query(payload: Any) -> tuple[List[Dict[str, Any]], str]:
    if isinstance(payload, list):
        return _ensure_dict_items(payload), "provider_import"

    if not isinstance(payload, dict):
        raise ValueError("Payload must be a JSON object or array")

    items_candidate = payload.get("items")
    if items_candidate is None:
        items_candidate = payload.get("data")
    if items_candidate is None:
        items_candidate = payload.get("results")

    if items_candidate is None:
        if payload:
            items_candidate = [payload]
        else:
            items_candidate = []

    query_text = (
        payload.get("query")
        or payload.get("searchQuery")
        or payload.get("search_string")
        or payload.get("searchString")
        or "provider_import"
    )

    return _ensure_dict_items(items_candidate), str(query_text)


def _ensure_dict_items(items: Any) -> List[Dict[str, Any]]:
    if items is None:
        return []
    if not isinstance(items, list):
        raise ValueError("Provider payload items must be an array")
    normalized: List[Dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Each provider item must be a JSON object")
        normalized.append(item)
    return normalized


def _map_provider_item(item: dict) -> BusinessResponse:
    def first_non_null(*values):
        for value in values:
            if value is not None:
                return value
        return None

    def first_non_empty_str(*values):
        for value in values:
            if isinstance(value, str) and value.strip():
                return value
        return None

    name = (
        item.get("title")
        or item.get("name")
        or item.get("businessName")
        or ""
    )

    place_id = item.get("placeId") or item.get("place_id") or ""

    category = item.get("categoryName") or item.get("category")
    types = item.get("types") or item.get("type") or ([] if not category else [category])
    if isinstance(types, str):
        types = [types]
    if not isinstance(types, list):
        types = []

    categories = item.get("categories")
    if isinstance(categories, str):
        categories = [categories]
    if not isinstance(categories, list):
        categories = []
    if not categories and types:
        categories = types

    location = item.get("location") if isinstance(item.get("location"), dict) else {}
    google_maps_url = first_non_empty_str(
        item.get("googleMapsUrl"),
        item.get("googleMapsUri"),
        item.get("placeUrl"),
        item.get("url"),
    )
    formatted_address = first_non_empty_str(
        item.get("formattedAddress"),
        item.get("address"),
        item.get("fullAddress"),
        item.get("streetAddress"),
        location.get("formattedAddress"),
        location.get("address"),
        item.get("location") if isinstance(item.get("location"), str) else None,
    )

    latitude = first_non_null(
        item.get("lat"),
        item.get("latitude"),
        location.get("lat"),
        location.get("latitude"),
        0,
    )
    longitude = first_non_null(
        item.get("lng"),
        item.get("longitude"),
        location.get("lng"),
        location.get("longitude"),
        0,
    )

    rating = first_non_null(item.get("rating"), item.get("stars"), item.get("totalScore"))
    user_ratings_total = (
        first_non_null(
            item.get("reviewsCount"),
            item.get("reviewCount"),
            item.get("totalReviews"),
            item.get("user_ratings_total"),
        )
    )

    photos = (
        item.get("imageUrls")
        or item.get("images")
        or item.get("photoUrls")
        or item.get("photos")
    )
    if photos is not None and not isinstance(photos, list):
        photos = [photos]
    if isinstance(photos, list):
        cleaned_photos = []
        for photo in photos:
            if isinstance(photo, str):
                cleaned_photos.append(photo)
            elif isinstance(photo, dict):
                url = photo.get("url") or photo.get("photoUrl") or photo.get("imageUrl")
                if url:
                    cleaned_photos.append(url)
        photos = cleaned_photos or None

    opening_hours = None
    raw_opening_hours = item.get("openingHours")
    if isinstance(raw_opening_hours, dict):
        opening_hours = {
            "open_now": raw_opening_hours.get("openNow"),
            "weekday_text": raw_opening_hours.get("weekdayText"),
        }
    elif isinstance(raw_opening_hours, list):
        weekday_text = []
        for entry in raw_opening_hours:
            if not isinstance(entry, dict):
                continue
            day = entry.get("day")
            hours = entry.get("hours")
            if day and hours:
                weekday_text.append(f"{day}: {hours}")
        opening_hours = {
            "open_now": None,
            "weekday_text": weekday_text or None,
        }
    opening_hours_raw = raw_opening_hours if isinstance(raw_opening_hours, list) else None

    photos = photos or ([item.get("imageUrl")] if item.get("imageUrl") else None)

    business_status = first_non_null(item.get("businessStatus"), item.get("status"))
    if business_status is None:
        if item.get("permanentlyClosed") is True:
            business_status = "CLOSED_PERMANENTLY"
        elif item.get("temporarilyClosed") is True:
            business_status = "CLOSED_TEMPORARILY"
        else:
            business_status = "OPERATIONAL"

    country = first_non_null(item.get("country"), item.get("countryName"), item.get("countryCode"))

    result = BusinessResponse(
        name=name,
        place_id=place_id,
        types=types,
        primary_type=types[0] if types else None,
        business_status=business_status,
        google_maps_url=google_maps_url,
        formatted_address=formatted_address,
        latitude=float(latitude or 0),
        longitude=float(longitude or 0),
        city=item.get("city"),
        state=item.get("state"),
        country=country,
        postal_code=item.get("postalCode") or item.get("zip"),
        formatted_phone_number=item.get("phone") or item.get("phoneNumber"),
        international_phone_number=first_non_null(
            item.get("internationalPhoneNumber"),
            item.get("phoneUnformatted"),
            item.get("internationalPhone"),
        ),
        website=item.get("website") or item.get("domain"),
        rating=rating,
        user_ratings_total=user_ratings_total,
        price_level=first_non_null(item.get("priceLevel"), item.get("price")),
        opening_hours=opening_hours,
        photos=photos,
        categories=categories,
        neighborhood=item.get("neighborhood"),
        street=item.get("street"),
        claim_this_business=item.get("claimThisBusiness"),
        rank=item.get("rank"),
        image_url=item.get("imageUrl"),
        images_count=item.get("imagesCount"),
        reviews_distribution=item.get("reviewsDistribution"),
        temporarily_closed=item.get("temporarilyClosed"),
        permanently_closed=item.get("permanentlyClosed"),
        is_advertisement=item.get("isAdvertisement"),
        cid=item.get("cid"),
        fid=item.get("fid"),
        kgmid=item.get("kgmid"),
        search_string=item.get("searchString"),
        search_page_url=item.get("searchPageUrl"),
        scraped_at=item.get("scrapedAt"),
        additional_info=item.get("additionalInfo"),
        opening_hours_raw=opening_hours_raw,
    )
    if not result.name and not result.place_id:
        logger.debug("Empty mapping for item keys: %s", list(item.keys()))
    return result


def _is_provider_error(items: list) -> bool:
    if len(items) != 1:
        return False
    item = items[0] if items else {}
    if not isinstance(item, dict):
        return False
    return "error" in item and "errorDescription" in item

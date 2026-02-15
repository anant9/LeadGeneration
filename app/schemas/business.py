"""Business Schema Models"""
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class BusinessSearch(BaseModel):
    """Business search request schema"""
    
    latitude: float = Field(..., description="Search latitude")
    longitude: float = Field(..., description="Search longitude")
    business_type: str = Field(..., description="Type of business to search for")
    radius: Optional[int] = Field(5000, description="Search radius in meters")
    max_results: Optional[int] = Field(50, description="Maximum number of results")


class BusinessResponse(BaseModel):
    """Business response schema - V1 (Google Places only)"""

    name: str
    place_id: str
    types: List[str] = Field(default_factory=list)
    primary_type: Optional[str] = None
    business_status: Optional[str] = None
    google_maps_url: Optional[str] = None

    formatted_address: Optional[str] = None
    latitude: float
    longitude: float
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

    formatted_phone_number: Optional[str] = None
    international_phone_number: Optional[str] = None
    website: Optional[str] = None

    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    price_level: Optional[str] = None
    opening_hours: Optional[dict] = None

    photos: Optional[List[str]] = None

    categories: List[str] = Field(default_factory=list)
    neighborhood: Optional[str] = None
    street: Optional[str] = None
    claim_this_business: Optional[bool] = None
    rank: Optional[int] = None
    image_url: Optional[str] = None
    images_count: Optional[int] = None
    reviews_distribution: Optional[Dict[str, Any]] = None

    temporarily_closed: Optional[bool] = None
    permanently_closed: Optional[bool] = None
    is_advertisement: Optional[bool] = None

    cid: Optional[str] = None
    fid: Optional[str] = None
    kgmid: Optional[str] = None
    search_string: Optional[str] = None
    search_page_url: Optional[str] = None
    scraped_at: Optional[str] = None

    additional_info: Optional[Dict[str, Any]] = None
    opening_hours_raw: Optional[List[Dict[str, Any]]] = None


class SearchResultsResponse(BaseModel):
    """Search results response schema"""
    
    total_results: int = Field(..., description="Total number of results found")
    results: List[BusinessResponse] = Field(default_factory=list)
    query: dict = Field(..., description="Search query parameters")


class NaturalLanguageBusinessSearch(BaseModel):
    """Natural language business search request schema"""

    query: str = Field(..., description="Natural language business search query")

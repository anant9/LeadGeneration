"""Google Maps API Service"""
import logging
from typing import List, Optional
import requests
from app.config import settings
from app.models.business import Business

logger = logging.getLogger(__name__)

# New Google Places API v1 endpoints
PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACES_NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"
GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Field masks (search vs details)
PLACES_SEARCH_FIELD_MASK = (
    "places.id,places.displayName,places.types,places.businessStatus,"
    "places.googleMapsUri,places.formattedAddress,places.location,"
    "places.rating,places.userRatingCount,places.priceLevel,places.photos"
)
PLACES_DETAILS_FIELD_MASK = (
    "displayName,types,businessStatus,googleMapsUri,formattedAddress,location,"
    "addressComponents,nationalPhoneNumber,internationalPhoneNumber,websiteUri,"
    "rating,userRatingCount,priceLevel,regularOpeningHours,currentOpeningHours,photos"
)


class GoogleMapsService:
    """Service for interacting with Google Maps API (v1)"""
    
    def __init__(self):
        """Initialize with API key"""
        if not settings.GOOGLE_MAPS_API_KEY:
            raise ValueError("GOOGLE_MAPS_API_KEY not set in environment variables")
        self.api_key = settings.GOOGLE_MAPS_API_KEY
    
    def search_nearby_businesses(
        self,
        latitude: float,
        longitude: float,
        business_type: str,
        radius: int = 5000,
        max_results: int = 50,
    ) -> List[Business]:
        """
        Search for nearby businesses using Google Places API (New)
        
        Args:
            latitude: Search center latitude
            longitude: Search center longitude
            business_type: Type of business to search for
            radius: Search radius in meters
            max_results: Maximum number of results to return
            
        Returns:
            List of Business objects
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": PLACES_SEARCH_FIELD_MASK,
            }
            
            payload = {
                "maxResultCount": min(max_results, 20),  # API limit per request
                "locationRestriction": {
                    "circle": {
                        "center": {
                            "latitude": latitude,
                            "longitude": longitude,
                        },
                        "radius": radius,
                    }
                },
                "includedTypes": [business_type],
            }
            
            response = requests.post(PLACES_NEARBY_SEARCH_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            businesses = []
            for place in data.get("places", []):
                business = self._parse_new_api_result(place)
                businesses.append(business)
            
            logger.info(f"Found {len(businesses)} businesses for type: {business_type}")
            return businesses
            
        except Exception as e:
            logger.error(f"Error searching nearby businesses: {str(e)}")
            raise
    
    def text_search_businesses(
        self,
        query: str,
        max_results: int = 50,
    ) -> List[Business]:
        """
        Search for businesses using natural language text query
        
        Args:
            query: Natural language search query (e.g., "cafe in new york city")
            max_results: Maximum number of results to return
            
        Returns:
            List of Business objects
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": PLACES_SEARCH_FIELD_MASK,
            }
            
            payload = {
                "textQuery": query,
                "maxResultCount": min(max_results, 20),  # API limit per request
            }
            
            logger.info(f"Sending request to Places API with query: {query}")
            response = requests.post(PLACES_TEXT_SEARCH_URL, json=payload, headers=headers, timeout=10)
            
            # Log response for debugging
            logger.info(f"API Response Status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                response.raise_for_status()
            
            data = response.json()
            
            businesses = []
            for place in data.get("places", []):
                business = self._parse_new_api_result(place)
                businesses.append(business)
            
            logger.info(f"Found {len(businesses)} businesses for query: {query}")
            return businesses
            
        except Exception as e:
            logger.error(f"Error in text search: {str(e)}", exc_info=True)
            raise
    
    def _parse_new_api_result(self, place: dict) -> Business:
        """
        Parse Google Places API (New) result into Business object
        Extract ALL available fields from the API response
        
        Args:
            place: Place result from new Google Places API
            
        Returns:
            Business object with all available data
        """
        location = place.get("location", {})
        place_id = place.get("id")
        types = place.get("types") or []

        details = self.get_place_details(
            place_id,
            field_mask=PLACES_DETAILS_FIELD_MASK,
        ) if place_id else {}

        address_components = details.get("addressComponents") or []
        city, state, country, postal_code = self._extract_address_parts(address_components)

        opening_hours = details.get("regularOpeningHours") or {}
        current_opening = details.get("currentOpeningHours") or {}
        open_now = opening_hours.get("openNow")
        if open_now is None:
            open_now = current_opening.get("openNow")

        weekday_text = opening_hours.get("weekdayDescriptions")
        if not weekday_text:
            weekday_text = current_opening.get("weekdayDescriptions")

        photo_refs = []
        for photo in (details.get("photos") or place.get("photos") or []):
            ref = photo.get("name") or photo.get("photoReference")
            if ref:
                photo_refs.append(ref)

        business = Business(
            name=(place.get("displayName", {}).get("text") or details.get("displayName", {}).get("text") or ""),
            place_id=place_id or details.get("id") or "",
            types=types or details.get("types") or [],
            primary_type=(types[0] if types else (details.get("types") or [None])[0]),
            business_status=place.get("businessStatus") or details.get("businessStatus"),
            google_maps_url=place.get("googleMapsUri") or details.get("googleMapsUri"),
            formatted_address=place.get("formattedAddress") or details.get("formattedAddress"),
            latitude=location.get("latitude") or (details.get("location") or {}).get("latitude") or 0,
            longitude=location.get("longitude") or (details.get("location") or {}).get("longitude") or 0,
            city=city,
            state=state,
            country=country,
            postal_code=postal_code,
            formatted_phone_number=details.get("nationalPhoneNumber"),
            international_phone_number=details.get("internationalPhoneNumber"),
            website=details.get("websiteUri"),
            rating=place.get("rating") or details.get("rating"),
            user_ratings_total=place.get("userRatingCount") or details.get("userRatingCount"),
            price_level=place.get("priceLevel") or details.get("priceLevel"),
            opening_hours_open_now=open_now,
            opening_hours_weekday_text=weekday_text,
            photos=photo_refs or None,
        )
        return business
    
    def get_place_details(self, place_id: str, field_mask: Optional[str] = None) -> dict:
        """
        Get detailed information about a place
        
        Args:
            place_id: Google Place ID
            
        Returns:
            Dictionary with place details
        """
        try:
            url = f"https://places.googleapis.com/v1/places/{place_id}"
            headers = {
                "X-Goog-Api-Key": self.api_key,
            }
            if field_mask:
                headers["X-Goog-FieldMask"] = field_mask
            
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                logger.error(
                    f"Place details error: {response.status_code} - {response.text}"
                )
                return {}
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting place details: {str(e)}")
            return {}
    
    def geocode_address(self, address: str) -> Optional[tuple]:
        """
        Convert address to coordinates
        
        Args:
            address: Address string
            
        Returns:
            Tuple of (latitude, longitude) or None
        """
        try:
            params = {
                "address": address,
                "key": self.api_key,
            }
            
            response = requests.get(GEOCODING_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("results"):
                location = data["results"][0]["geometry"]["location"]
                return (location["lat"], location["lng"])
            return None
            
        except Exception as e:
            logger.error(f"Error geocoding address: {str(e)}")
            raise

    def _extract_address_parts(self, components: List[dict]) -> tuple:
        city = state = country = postal_code = None
        for comp in components:
            types = comp.get("types", [])
            value = comp.get("longText") or comp.get("shortText")
            if not value:
                continue
            if "locality" in types or "postal_town" in types:
                city = value
            elif "administrative_area_level_1" in types:
                state = value
            elif "country" in types:
                country = value
            elif "postal_code" in types:
                postal_code = value
        return city, state, country, postal_code

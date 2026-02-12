"""Location and Business Search Service"""
import logging
from typing import List, Optional
import requests
from app.config import settings
from app.models.business import Business

logger = logging.getLogger(__name__)

# API endpoints
PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"
GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"


class LocationService:
    """Service for location-based business search"""
    
    def __init__(self):
        """Initialize with API key"""
        if not settings.API_KEY:
            raise ValueError("API_KEY not set in environment variables")
        self.api_key = settings.API_KEY
    
    def search_nearby_businesses(
        self,
        latitude: float,
        longitude: float,
        business_type: str,
        radius: int = 5000,
        max_results: int = 50,
    ) -> List[Business]:
        """
        Search for nearby businesses at a location
        
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
            # Use text search with location bias
            query = f"{business_type} near {latitude},{longitude}"
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "*",
            }
            
            payload = {
                "textQuery": query,
                "maxResultCount": min(max_results, 20),
                "locationBias": {
                    "circle": {
                        "center": {
                            "latitude": latitude,
                            "longitude": longitude,
                        },
                        "radius": radius,
                    }
                },
            }
            
            response = requests.post(PLACES_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            businesses = []
            for place in data.get("places", []):
                business = self._parse_place_result(place)
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
        Search for businesses using text query
        
        Args:
            query: Search query (e.g., "cafe in new york city")
            max_results: Maximum number of results to return
            
        Returns:
            List of Business objects
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "*",
            }
            
            payload = {
                "textQuery": query,
                "maxResultCount": min(max_results, 20),
            }
            
            logger.info(f"Sending request with query: {query}")
            response = requests.post(PLACES_API_URL, json=payload, headers=headers, timeout=10)
            
            logger.info(f"Response Status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                response.raise_for_status()
            
            data = response.json()
            
            businesses = []
            for place in data.get("places", []):
                business = self._parse_place_result(place)
                businesses.append(business)
            
            logger.info(f"Found {len(businesses)} businesses for query: {query}")
            return businesses
            
        except Exception as e:
            logger.error(f"Error in search: {str(e)}", exc_info=True)
            raise
    
    def _parse_place_result(self, place: dict) -> Business:
        """
        Parse place result into Business object
        
        Args:
            place: Place result from API
            
        Returns:
            Business object with available data
        """
        location = place.get("location", {})
        
        # Extract core fields
        business_data = {
            "name": place.get("displayName", {}).get("text", ""),
            "address": place.get("formattedAddress", ""),
            "latitude": location.get("latitude", 0),
            "longitude": location.get("longitude", 0),
            "business_type": place.get("types", ["unknown"])[0] if place.get("types") else "unknown",
            "phone": place.get("internationalPhoneNumber"),
            "website": place.get("websiteUri"),
            "rating": place.get("rating"),
            "review_count": place.get("userRatingCount"),
        }
        
        # Extract additional fields if available
        additional_fields = {
            "place_id": place.get("id"),
            "opening_hours": place.get("openingHours"),
            "business_status": place.get("businessStatus"),
            "editorial_summary": place.get("editorialSummary"),
            "reviews": place.get("reviews"),
            "photos": place.get("photos"),
            "plus_code": place.get("plusCode"),
            "accessibility": place.get("accessibilityOptions"),
            "price_level": place.get("priceLevel"),
            "types": place.get("types"),
            "formatted_phone": place.get("formattedPhoneNumber"),
            "current_opening_hours": place.get("currentOpeningHours"),
        }
        
        # Remove None values to keep response clean
        additional_fields = {k: v for k, v in additional_fields.items() if v is not None}
        
        business = Business(**business_data, **additional_fields)
        return business
    
    def get_place_details(self, place_id: str) -> dict:
        """
        Get detailed information about a place
        
        Args:
            place_id: Place ID
            
        Returns:
            Dictionary with place details
        """
        try:
            url = f"https://places.googleapis.com/v1/places/{place_id}"
            headers = {
                "X-Goog-Api-Key": self.api_key,
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting place details: {str(e)}")
            raise
    
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

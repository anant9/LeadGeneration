"""Business Data Model - V1 (Google Places only)"""
from typing import Optional, List


class Business:
    """Business data model with strictly Google Places API fields"""

    def __init__(
        self,
        name: str,
        place_id: str,
        types: List[str],
        business_status: Optional[str],
        google_maps_url: Optional[str],
        formatted_address: Optional[str],
        latitude: float,
        longitude: float,
        city: Optional[str],
        state: Optional[str],
        country: Optional[str],
        postal_code: Optional[str],
        formatted_phone_number: Optional[str],
        international_phone_number: Optional[str],
        website: Optional[str],
        rating: Optional[float],
        user_ratings_total: Optional[int],
        price_level: Optional[str],
        opening_hours_open_now: Optional[bool],
        opening_hours_weekday_text: Optional[List[str]],
        photos: Optional[List[str]],
        primary_type: Optional[str] = None,
    ):
        self.name = name
        self.place_id = place_id
        self.types = types
        self.primary_type = primary_type
        self.business_status = business_status
        self.google_maps_url = google_maps_url
        self.formatted_address = formatted_address
        self.latitude = latitude
        self.longitude = longitude
        self.city = city
        self.state = state
        self.country = country
        self.postal_code = postal_code
        self.formatted_phone_number = formatted_phone_number
        self.international_phone_number = international_phone_number
        self.website = website
        self.rating = rating
        self.user_ratings_total = user_ratings_total
        self.price_level = price_level
        self.opening_hours_open_now = opening_hours_open_now
        self.opening_hours_weekday_text = opening_hours_weekday_text
        self.photos = photos

    def to_dict(self):
        """Convert business to dictionary with V1 schema only"""
        return {
            "name": self.name,
            "place_id": self.place_id,
            "types": self.types,
            "primary_type": self.primary_type,
            "business_status": self.business_status,
            "google_maps_url": self.google_maps_url,
            "formatted_address": self.formatted_address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "postal_code": self.postal_code,
            "formatted_phone_number": self.formatted_phone_number,
            "international_phone_number": self.international_phone_number,
            "website": self.website,
            "rating": self.rating,
            "user_ratings_total": self.user_ratings_total,
            "price_level": self.price_level,
            "opening_hours": {
                "open_now": self.opening_hours_open_now,
                "weekday_text": self.opening_hours_weekday_text,
            },
            "photos": self.photos,
        }

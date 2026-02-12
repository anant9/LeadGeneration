"""Helper Utilities"""
import math
from typing import List, Dict, Any


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Args:
        lat1: First latitude
        lon1: First longitude
        lat2: Second latitude
        lon2: Second longitude
        
    Returns:
        Distance in kilometers
    """
    R = 6371  # Earth radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def get_response_mode_info() -> dict:
    """
    Get information about available response modes and their field mappings
    
    Returns:
        Dictionary with response mode configurations
    """
    return {
        "full": {
            "description": "Returns all available fields from Google Maps API",
            "fields": [
                "name",
                "address",
                "latitude",
                "longitude",
                "business_type",
                "phone",
                "website",
                "rating",
                "review_count",
                "place_id",
                "opening_hours",
                "business_status",
                "editorial_summary",
                "reviews",
                "photos",
                "plus_code",
                "accessibility",
                "price_level",
                "types",
                "formatted_phone",
                "current_opening_hours"
            ]
        },
        "limited": {
            "description": "Returns only fields mappable to Salesforce Lead object",
            "salesforce_mapping": {
                "name": "Salesforce Lead LastName or Company",
                "phone": "Salesforce Lead Phone",
                "website": "Salesforce Lead Website",
                "address": "Salesforce Lead Street (combined with City/Country)",
                "business_type": "Salesforce Lead Industry",
                "latitude": "For mapping/geocoding purposes",
                "longitude": "For mapping/geocoding purposes"
            },
            "fields": [
                "name",
                "address",
                "phone",
                "website",
                "business_type",
                "latitude",
                "longitude"
            ]
        }
    }


def normalize_results_consistency(results: List[Dict[str, Any]], limited_fields: List[str] = None) -> List[Dict[str, Any]]:
    """
    Normalize results to ensure field consistency across all records.
    
    For every field that appears in ANY record, ensure it appears in ALL records.
    If a field is missing in a record, it's added with a null value.
    
    Args:
        results: List of result dictionaries
        limited_fields: Optional list of fields to include. If provided, only these fields are returned,
                       and only fields with at least one non-null value across all records are kept.
        
    Returns:
        List of normalized results with consistent fields across all records
    """
    if not results:
        return results
    
    # If limited_fields specified, filter to only those fields first
    if limited_fields:
        results = [{k: result.get(k) for k in limited_fields} for result in results]
        
        # Find which limited fields have at least one non-null value
        fields_with_data = set()
        for result in results:
            for key, value in result.items():
                if value is not None:
                    fields_with_data.add(key)
        
        # Filter results to only include fields that have data
        results = [{k: v for k, v in result.items() if k in fields_with_data} for result in results]
    
    # Collect all unique keys across all results
    all_keys = set()
    for result in results:
        all_keys.update(result.keys())
    
    # Normalize each result to have all keys
    normalized_results = []
    for result in results:
        normalized = {}
        for key in all_keys:
            normalized[key] = result.get(key, None)
        normalized_results.append(normalized)
    
    return normalized_results



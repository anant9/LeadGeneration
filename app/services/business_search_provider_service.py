"""External business search provider service"""
import logging
from typing import List, Dict, Any
import requests
from app.config import settings

logger = logging.getLogger(__name__)



class BusinessSearchProviderService:
    """Service for calling the external search provider and returning dataset items"""

    def __init__(self):
        if not settings.SEARCH_PROVIDER_API_TOKEN:
            raise ValueError("SEARCH_PROVIDER_API_TOKEN not set in environment variables")
        if not settings.SEARCH_PROVIDER_BASE_URL:
            raise ValueError("SEARCH_PROVIDER_BASE_URL not set in environment variables")
        self.api_token = settings.SEARCH_PROVIDER_API_TOKEN
        self.actor_id = settings.SEARCH_PROVIDER_ACTOR_ID
        self.base_url = settings.SEARCH_PROVIDER_BASE_URL.rstrip("/")

    def run_search(self, input_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Run the provider job synchronously and return dataset items"""
        url = f"{self.base_url}/v2/acts/{self.actor_id}/run-sync-get-dataset-items"
        params = {
            "token": self.api_token,
            "clean": "true",
        }

        logger.info("Running external search provider job")
        response = requests.post(url, params=params, json=input_payload, timeout=90)
        logger.debug("Provider response status: %s", response.status_code)
        response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and "items" in data:
            items = data.get("items") or []
        else:
            items = data

        if not isinstance(items, list):
            raise ValueError("Unexpected search provider response format")

        return items

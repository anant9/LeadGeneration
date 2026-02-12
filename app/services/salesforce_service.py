"""Salesforce API Service (minimal scaffold)"""
import logging
import requests
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)


class SalesforceService:
    def __init__(self, access_token: Optional[str] = None, instance_url: Optional[str] = None):
        self.access_token = access_token or settings.SALESFORCE_ACCESS_TOKEN
        self.instance_url = instance_url or settings.SALESFORCE_INSTANCE_URL
        self.api_version = settings.SALESFORCE_API_VERSION
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    def verify_connection(self) -> Dict[str, Any]:
        try:
            if not self.instance_url or not self.access_token:
                return {"connected": False, "message": "Missing Salesforce credentials"}
            r = requests.get(f"{self.instance_url}/services/data/v{self.api_version}/", headers=self.headers, timeout=10)
            if r.status_code == 200:
                return {"connected": True, "message": "Connected to Salesforce"}
            return {"connected": False, "message": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"connected": False, "message": str(e)}

    def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            url = f"{self.instance_url}/services/data/v{self.api_version}/sobjects/Contact/"
            r = requests.post(url, json=lead_data, headers=self.headers, timeout=15)
            if r.status_code in (200, 201):
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

    def create_or_update_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        # Upsert via external ID is more involved; fallback to create
        return self.create_lead(lead_data)

    def batch_create_leads(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        for l in leads:
            results.append(self.create_lead(l))
        return {"success": True, "data": results}

    def get_contacts(self, limit: int = 100) -> Dict[str, Any]:
        try:
            query = f"SELECT Id, FirstName, LastName, Email, Phone FROM Contact LIMIT {limit}"
            url = f"{self.instance_url}/services/data/v{self.api_version}/query"
            r = requests.get(url, params={"q": query}, headers=self.headers, timeout=10)
            if r.status_code == 200:
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

    def create_deal(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            url = f"{self.instance_url}/services/data/v{self.api_version}/sobjects/Opportunity/"
            r = requests.post(url, json=deal_data, headers=self.headers, timeout=10)
            if r.status_code in (200, 201):
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

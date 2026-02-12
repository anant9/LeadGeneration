"""Zoho CRM API Service (minimal scaffold)"""
import logging
import requests
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

ZOHO_BASE = settings.ZOHO_BASE_URL


class ZohoService:
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or settings.ZOHO_ACCESS_TOKEN
        self.base_url = ZOHO_BASE
        self.headers = {
            "Authorization": f"Zoho-oauthtoken {self.access_token}",
            "Content-Type": "application/json"
        }

    def verify_connection(self) -> Dict[str, Any]:
        try:
            r = requests.get(f"{self.base_url}/users", headers=self.headers, timeout=10)
            if r.status_code == 200:
                return {"connected": True, "message": "Connected to Zoho"}
            else:
                return {"connected": False, "message": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"connected": False, "message": str(e)}

    def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            payload = {"data": [lead_data]}
            r = requests.post(f"{self.base_url}/Leads", json=payload, headers=self.headers, timeout=15)
            if r.status_code in (200, 201):
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

    def batch_create_leads(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self.create_lead({"data": leads})

    def create_or_update_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        # Zoho upsert requires external_id logic; keep simple: create
        return self.create_lead(lead_data)

    def get_contacts(self, limit: int = 100) -> Dict[str, Any]:
        try:
            params = {"per_page": limit}
            r = requests.get(f"{self.base_url}/Contacts", headers=self.headers, params=params, timeout=10)
            if r.status_code == 200:
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

    def create_deal(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            payload = {"data": [deal_data]}
            r = requests.post(f"{self.base_url}/Deals", json=payload, headers=self.headers, timeout=10)
            if r.status_code in (200, 201):
                return {"success": True, "data": r.json()}
            return {"success": False, "error": r.text}
        except Exception as e:
            logger.error(str(e))
            return {"success": False, "error": str(e)}

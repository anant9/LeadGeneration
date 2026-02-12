"""Generic CRM helper for Streamlit to call provider endpoints."""
import requests
from typing import Dict, Any, Optional, List


class CrmStreamlitHelper:
    def __init__(self, api_base_url: str = "http://localhost:8000", provider: str = "hubspot"):
        self.api_base_url = api_base_url.rstrip("/")
        self.provider = provider.lower()
        self.endpoint = f"{self.api_base_url}/api/v1/{self.provider}"

    def check_connection(self) -> Dict[str, Any]:
        try:
            r = requests.get(f"{self.endpoint}/status", timeout=10)
            return r.json()
        except Exception as e:
            return {"connected": False, "message": str(e)}

    def set_connection(self, access_token: str, client_id: Optional[str] = None, client_secret: Optional[str] = None) -> Dict[str, Any]:
        try:
            payload = {"access_token": access_token, "client_id": client_id, "client_secret": client_secret}
            r = requests.post(f"{self.endpoint}/connection", json=payload, timeout=10)
            return r.json()
        except Exception as e:
            return {"connected": False, "message": str(e)}

    def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            r = requests.post(f"{self.endpoint}/leads", json=lead_data, timeout=15)
            return r.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    def create_batch_leads(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            r = requests.post(f"{self.endpoint}/leads/batch", json={"leads": leads}, timeout=30)
            return r.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    def upsert_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            r = requests.post(f"{self.endpoint}/leads/upsert", json=lead_data, timeout=15)
            return r.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    def create_deal(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            r = requests.post(f"{self.endpoint}/deals", json=deal_data, timeout=15)
            return r.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    def search_contacts(self, query: str, limit: int = 10) -> Dict[str, Any]:
        try:
            r = requests.post(f"{self.endpoint}/contacts/search", params={"query": query, "limit": limit}, timeout=10)
            return r.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

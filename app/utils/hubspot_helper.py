"""HubSpot Integration for Streamlit - Helper Module"""
import requests
import json
from typing import Dict, Any, Optional, List


class HubSpotStreamlitHelper:
    """Helper class for HubSpot integration in Streamlit"""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.hubspot_endpoint = f"{api_base_url}/api/v1/hubspot"
    
    def check_connection(self) -> Dict[str, Any]:
        """Check HubSpot connection status"""
        try:
            response = requests.get(
                f"{self.hubspot_endpoint}/status",
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"connected": False, "message": str(e)}
    
    def set_connection(self, access_token: str, client_id: str = None, client_secret: str = None) -> Dict[str, Any]:
        """Set HubSpot connection credentials"""
        try:
            payload = {
                "access_token": access_token,
                "client_id": client_id,
                "client_secret": client_secret
            }
            response = requests.post(
                f"{self.hubspot_endpoint}/connection",
                json=payload,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"connected": False, "message": str(e), "error": str(e)}
    
    def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a single lead in HubSpot"""
        try:
            response = requests.post(
                f"{self.hubspot_endpoint}/leads",
                json=lead_data,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_batch_leads(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create multiple leads in HubSpot"""
        try:
            payload = {"leads": leads}
            response = requests.post(
                f"{self.hubspot_endpoint}/leads/batch",
                json=payload,
                timeout=30
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def upsert_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a lead in HubSpot"""
        try:
            response = requests.post(
                f"{self.hubspot_endpoint}/leads/upsert",
                json=lead_data,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_deal(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a deal in HubSpot"""
        try:
            response = requests.post(
                f"{self.hubspot_endpoint}/deals",
                json=deal_data,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def search_contacts(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for contacts in HubSpot"""
        try:
            response = requests.post(
                f"{self.hubspot_endpoint}/contacts/search",
                params={"query": query, "limit": limit},
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def convert_google_to_hubspot(self, business_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Google business data to HubSpot lead format"""
        try:
            response = requests.post(
                f"{self.hubspot_endpoint}/convert/google-to-hubspot",
                json=business_data,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

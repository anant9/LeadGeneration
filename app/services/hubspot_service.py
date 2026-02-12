"""HubSpot API Service for Lead Ingestion"""
import logging
import requests
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

HUBSPOT_BASE_URL = "https://api.hubapi.com"


class HubSpotService:
    """Service for interacting with HubSpot API"""
    
    def __init__(self, access_token: Optional[str] = None):
        """Initialize with HubSpot access token
        
        Args:
            access_token: HubSpot API access token. If not provided, uses HUBSPOT_API_KEY from settings
        """
        self.access_token = access_token or settings.HUBSPOT_API_KEY
        self.base_url = HUBSPOT_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def verify_connection(self) -> Dict[str, Any]:
        """Verify HubSpot API connection
        
        Returns:
            Dictionary with connection status and portal info
        """
        try:
            response = requests.get(
                f"{self.base_url}/crm/v3/objects/contacts?limit=1",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                return {"connected": True, "message": "Successfully connected to HubSpot"}
            else:
                return {
                    "connected": False, 
                    "message": f"HubSpot API error: {response.status_code}",
                    "error": response.text
                }
        except Exception as e:
            logger.error(f"HubSpot connection error: {str(e)}")
            return {"connected": False, "message": str(e)}
    
    def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a contact (lead) in HubSpot
        
        Args:
            lead_data: Dictionary containing lead information
                Expected keys: email, firstname, lastname, phone, company, website
        
        Returns:
            Dictionary with created contact info or error
        """
        try:
            # Map lead data to HubSpot contact properties
            properties = self._map_to_hubspot_properties(lead_data)
            
            payload = {
                "properties": properties
            }
            
            response = requests.post(
                f"{self.base_url}/crm/v3/objects/contacts",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                contact_data = response.json()
                return {
                    "success": True,
                    "contact_id": contact_data.get("id"),
                    "data": contact_data
                }
            else:
                return {
                    "success": False,
                    "error": f"HubSpot API error: {response.status_code}",
                    "details": response.text
                }
        except Exception as e:
            logger.error(f"Error creating HubSpot lead: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_or_update_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a contact in HubSpot (upsert)
        
        Args:
            lead_data: Dictionary containing lead information
        
        Returns:
            Dictionary with upserted contact info or error
        """
        try:
            properties = self._map_to_hubspot_properties(lead_data)
            email = lead_data.get("email")
            
            if not email:
                return {"success": False, "error": "Email is required for upsert"}
            
            payload = {
                "inputs": [{
                    "email": email,
                    "properties": properties
                }]
            }
            
            response = requests.post(
                f"{self.base_url}/crm/v3/objects/contacts/batch/upsert",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "data": result
                }
            else:
                return {
                    "success": False,
                    "error": f"HubSpot API error: {response.status_code}",
                    "details": response.text
                }
        except Exception as e:
            logger.error(f"Error upserting HubSpot lead: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def batch_create_leads(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create multiple contacts in HubSpot
        
        Args:
            leads: List of lead data dictionaries
        
        Returns:
            Dictionary with batch creation results
        """
        try:
            inputs = []
            for lead in leads:
                inputs.append({
                    "properties": self._map_to_hubspot_properties(lead)
                })
            
            payload = {"inputs": inputs}
            
            response = requests.post(
                f"{self.base_url}/crm/v3/objects/contacts/batch/create",
                json=payload,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "total": len(leads),
                    "data": result
                }
            else:
                return {
                    "success": False,
                    "error": f"HubSpot API error: {response.status_code}",
                    "details": response.text
                }
        except Exception as e:
            logger.error(f"Error batch creating HubSpot leads: {str(e)}")
            return {"success": False, "error": str(e), "total": len(leads)}
    
    def get_contacts(self, limit: int = 100, after: Optional[str] = None) -> Dict[str, Any]:
        """Get contacts from HubSpot
        
        Args:
            limit: Number of contacts to retrieve
            after: Pagination token
        
        Returns:
            Dictionary with contacts list
        """
        try:
            params = {
                "limit": limit,
                "properties": ["firstname", "lastname", "email", "phone", "company", "website"]
            }
            if after:
                params["after"] = after
            
            response = requests.get(
                f"{self.base_url}/crm/v3/objects/contacts",
                headers=self.headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {
                    "success": False,
                    "error": f"HubSpot API error: {response.status_code}"
                }
        except Exception as e:
            logger.error(f"Error retrieving HubSpot contacts: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_deal(self, deal_data: Dict[str, Any], contact_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a deal in HubSpot
        
        Args:
            deal_data: Dictionary with deal information
            contact_id: Optional contact ID to associate with the deal
        
        Returns:
            Dictionary with created deal info
        """
        try:
            properties = {
                "dealname": deal_data.get("name", "New Deal"),
                "dealstage": deal_data.get("stage", "negotiation"),
                "amount": deal_data.get("amount", "0"),
                "description": deal_data.get("description", "")
            }
            
            payload = {"properties": properties}
            
            response = requests.post(
                f"{self.base_url}/crm/v3/objects/deals",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                deal = response.json()
                deal_id = deal.get("id")
                
                # Associate deal with contact if provided
                if deal_id and contact_id:
                    self._associate_deal_to_contact(deal_id, contact_id)
                
                return {"success": True, "deal_id": deal_id, "data": deal}
            else:
                return {
                    "success": False,
                    "error": f"HubSpot API error: {response.status_code}"
                }
        except Exception as e:
            logger.error(f"Error creating HubSpot deal: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _associate_deal_to_contact(self, deal_id: str, contact_id: str) -> bool:
        """Associate a deal with a contact
        
        Args:
            deal_id: HubSpot deal ID
            contact_id: HubSpot contact ID
        
        Returns:
            True if successful
        """
        try:
            payload = {
                "inputs": [{
                    "id": deal_id,
                    "types": [{
                        "associationType": "contact_to_deal"
                    }],
                    "to": {
                        "id": contact_id
                    }
                }]
            }
            
            response = requests.put(
                f"{self.base_url}/crm/v3/objects/deals/batch/associate",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            return response.status_code in [200, 201]
        except Exception as e:
            logger.error(f"Error associating deal to contact: {str(e)}")
            return False
    
    def _map_to_hubspot_properties(self, lead_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Map lead data to HubSpot contact properties
        
        Args:
            lead_data: Dictionary with lead information
        
        Returns:
            List of HubSpot property dictionaries
        """
        properties = []
        
        property_mapping = {
            "email": "email",
            "firstname": "firstname",
            "lastname": "lastname",
            "name": "lastname",  # Use as last name if firstname not provided
            "phone": "phone",
            "company": "company",
            "website": "website",
            "address": "address",
            "city": "city",
            "state": "state",
            "country": "country",
            "zipcode": "zip_code",
            "business_type": "lifecyclestage",
            "rating": "hs_lead_status",
            "latitude": "hs_analytics_latitude",
            "longitude": "hs_analytics_longitude"
        }
        
        for source_key, hubspot_key in property_mapping.items():
            if source_key in lead_data and lead_data[source_key]:
                properties.append({
                    "name": hubspot_key,
                    "value": str(lead_data[source_key])
                })
        
        return properties

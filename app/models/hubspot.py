"""HubSpot Data Models"""
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict


@dataclass
class HubSpotLead:
    """HubSpot Lead/Contact model"""
    email: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zipcode: Optional[str] = None
    business_type: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values"""
        return {k: v for k, v in asdict(self).items() if v is not None}
    
    def to_hubspot_properties(self) -> Dict[str, str]:
        """Convert to HubSpot API property format"""
        properties_map = {
            "email": self.email,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "phone": self.phone,
            "company": self.company,
            "website": self.website,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zip_code": self.zipcode,
            "lifecyclestage": self.business_type,
        }
        return {k: str(v) for k, v in properties_map.items() if v is not None}


@dataclass
class HubSpotDeal:
    """HubSpot Deal model"""
    dealname: str
    dealstage: str = "negotiation"
    amount: Optional[str] = None
    description: Optional[str] = None
    contact_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        data = {
            "dealname": self.dealname,
            "dealstage": self.dealstage,
        }
        if self.amount:
            data["amount"] = self.amount
        if self.description:
            data["description"] = self.description
        return data


class HubSpotAuth:
    """HubSpot OAuth and authentication models"""
    
    # OAuth endpoints
    AUTH_URL = "https://app.hubapi.com/oauth/authorize"
    TOKEN_URL = "https://api.hubapi.com/oauth/v1/token"
    
    @staticmethod
    def get_auth_url(client_id: str, redirect_uri: str, scopes: Optional[List[str]] = None) -> str:
        """Generate HubSpot OAuth authorization URL
        
        Args:
            client_id: HubSpot OAuth app client ID
            redirect_uri: Callback URL after authentication
            scopes: List of required scopes
        
        Returns:
            Authorization URL string
        """
        if not scopes:
            scopes = [
                "crm.objects.contacts.read",
                "crm.objects.contacts.write",
                "crm.objects.deals.read",
                "crm.objects.deals.write"
            ]
        
        scope_string = " ".join(scopes)
        return (
            f"{HubSpotAuth.AUTH_URL}?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"scope={scope_string}"
        )


class HubSpotConnection:
    """HubSpot Connection configuration"""
    
    def __init__(
        self,
        access_token: str,
        portal_id: Optional[str] = None,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None
    ):
        self.access_token = access_token
        self.portal_id = portal_id
        self.client_id = client_id
        self.client_secret = client_secret
    
    def to_dict(self) -> Dict[str, str]:
        """Convert to dictionary"""
        return {
            "access_token": self.access_token,
            "portal_id": self.portal_id,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

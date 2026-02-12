"""HubSpot API Schemas for Request/Response Validation"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class HubSpotLeadCreate(BaseModel):
    """Schema for creating a HubSpot contact"""
    email: EmailStr
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "firstname": "John",
                "lastname": "Doe",
                "phone": "+1234567890",
                "company": "ABC Corp",
                "website": "https://example.com",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "zipcode": "10001",
                "business_type": "Technology",
                "rating": 4.5,
                "review_count": 125
            }
        }


class HubSpotBatchLeadsCreate(BaseModel):
    """Schema for batch creating HubSpot contacts"""
    leads: List[HubSpotLeadCreate]
    
    class Config:
        json_schema_extra = {
            "example": {
                "leads": [
                    {
                        "email": "john@example.com",
                        "firstname": "John",
                        "lastname": "Doe",
                        "company": "ABC Corp"
                    }
                ]
            }
        }


class HubSpotDealCreate(BaseModel):
    """Schema for creating a HubSpot deal"""
    dealname: str
    dealstage: str = "negotiation"
    amount: Optional[str] = None
    description: Optional[str] = None
    contact_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "dealname": "ABC Corp Lead",
                "dealstage": "negotiation",
                "amount": "50000",
                "description": "High-value prospect from lead generation"
            }
        }


class HubSpotConnectionRequest(BaseModel):
    """Schema for HubSpot connection request"""
    access_token: str
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    portal_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "pat-na1-xxxxxxxxxxxxxxxxxxxxx",
                "client_id": "xxxxxxxxxxxxxxxxxxxxxxxx",
                "client_secret": "xxxxxxxxxxxxxxxxxxxxxxxx"
            }
        }


class HubSpotConnectionResponse(BaseModel):
    """Schema for HubSpot connection response"""
    connected: bool
    message: str
    portal_id: Optional[str] = None
    error: Optional[str] = None


class HubSpotLeadResponse(BaseModel):
    """Schema for successful HubSpot contact creation response"""
    success: bool
    contact_id: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class HubSpotBatchLeadsResponse(BaseModel):
    """Schema for batch lead creation response"""
    success: bool
    total: int
    created: int = 0
    failed: int = 0
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class HubSpotDealResponse(BaseModel):
    """Schema for HubSpot deal creation response"""
    success: bool
    deal_id: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class GoogleBusinessToHubSpot(BaseModel):
    """Schema for converting Google business result to HubSpot lead"""
    name: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    business_type: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

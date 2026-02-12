"""Unit Tests for HubSpot Service"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.hubspot_service import HubSpotService


class TestHubSpotService:
    """Test suite for HubSpot service"""
    
    @pytest.fixture
    def hubspot_service(self):
        """Create a HubSpot service instance for testing"""
        return HubSpotService(access_token="test-token")
    
    @patch('requests.get')
    def test_verify_connection_success(self, mock_get, hubspot_service):
        """Test successful HubSpot connection verification"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        result = hubspot_service.verify_connection()
        
        assert result.get("connected") == True
        assert "message" in result
    
    @patch('requests.get')
    def test_verify_connection_failure(self, mock_get, hubspot_service):
        """Test failed HubSpot connection verification"""
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        mock_get.return_value = mock_response
        
        result = hubspot_service.verify_connection()
        
        assert result.get("connected") == False
    
    @patch('requests.post')
    def test_create_lead_success(self, mock_post, hubspot_service):
        """Test successful lead creation"""
        mock_response = Mock()
        mock_response.status_code = 201
        mock_response.json.return_value = {
            "id": "contact-123"
        }
        mock_post.return_value = mock_response
        
        lead_data = {
            "email": "test@example.com",
            "firstname": "John",
            "lastname": "Doe"
        }
        
        result = hubspot_service.create_lead(lead_data)
        
        assert result.get("success") == True
        assert result.get("contact_id") == "contact-123"
    
    @patch('requests.post')
    def test_create_batch_leads(self, mock_post, hubspot_service):
        """Test batch lead creation"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [
                {"id": "contact-1"},
                {"id": "contact-2"}
            ]
        }
        mock_post.return_value = mock_response
        
        leads = [
            {"email": "test1@example.com", "firstname": "John"},
            {"email": "test2@example.com", "firstname": "Jane"}
        ]
        
        result = hubspot_service.batch_create_leads(leads)
        
        assert result.get("success") == True
        assert result.get("total") == 2
    
    def test_map_to_hubspot_properties(self, hubspot_service):
        """Test mapping lead data to HubSpot properties"""
        lead_data = {
            "email": "test@example.com",
            "firstname": "John",
            "lastname": "Doe",
            "phone": "123456789",
            "company": "Test Corp",
            "website": "https://test.com"
        }
        
        properties = hubspot_service._map_to_hubspot_properties(lead_data)
        
        assert len(properties) > 0
        assert any(p["name"] == "email" for p in properties)
        assert any(p["value"] == "test@example.com" for p in properties)


class TestHubSpotModels:
    """Test suite for HubSpot models"""
    
    def test_hubspot_lead_to_dict(self):
        """Test HubSpot lead conversion to dictionary"""
        from app.models.hubspot import HubSpotLead
        
        lead = HubSpotLead(
            email="test@example.com",
            firstname="John",
            lastname="Doe",
            company="Test Corp"
        )
        
        lead_dict = lead.to_dict()
        
        assert lead_dict["email"] == "test@example.com"
        assert lead_dict["firstname"] == "John"
        assert "review_count" not in lead_dict  # None values excluded
    
    def test_hubspot_deal_to_dict(self):
        """Test HubSpot deal conversion to dictionary"""
        from app.models.hubspot import HubSpotDeal
        
        deal = HubSpotDeal(
            dealname="Test Deal",
            dealstage="negotiation",
            amount="50000"
        )
        
        deal_dict = deal.to_dict()
        
        assert deal_dict["dealname"] == "Test Deal"
        assert deal_dict["amount"] == "50000"

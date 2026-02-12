# HubSpot Integration Documentation

## Overview

This Lead Generation application now includes full HubSpot CRM integration for seamless lead ingestion from Google Maps searches directly into your HubSpot account.

## Features

- 🔗 **HubSpot OAuth & API Integration** - Connect your HubSpot account securely
- 📤 **Automatic Lead Sync** - Convert search results to HubSpot contacts instantly
- 📊 **Batch Lead Import** - Import multiple leads at once
- 🤝 **Deal Management** - Create and manage deals in HubSpot
- 🔍 **Contact Search** - Search existing HubSpot contacts
- 🔄 **Upsert Capability** - Automatically update existing contacts
- 📈 **Lead Tracking** - Track lead location and business information

## Setup Instructions

### 1. Get HubSpot API Credentials

#### Option A: Private App (Recommended)

1. Go to [HubSpot Developer Dashboard](https://developers.hubspot.com)
2. Click on "Create app" → "Private app"
3. Name your app (e.g., "Lead Generation Integration")
4. Under "Scopes", enable:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
5. Copy the **Access Token**

#### Option B: OAuth App

1. Go to [HubSpot Developer Dashboard](https://developers.hubspot.com)
2. Create an OAuth app
3. Set Redirect URI to: `http://localhost:8000/api/v1/hubspot/callback`
4. Copy **Client ID** and **Client Secret**

### 2. Environment Variables

Create or update your `.env` file:

```env
# HubSpot API Configuration
HUBSPOT_API_KEY=your_private_app_token_here
# OR for OAuth:
HUBSPOT_OAUTH_CLIENT_ID=your_client_id_here
HUBSPOT_OAUTH_CLIENT_SECRET=your_client_secret_here
HUBSPOT_REDIRECT_URI=http://localhost:8000/api/v1/hubspot/callback

# Google Maps API (existing)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

New packages added:
- `email-validator>=2.1.0` - For email validation in schemas
- `hubspot-api-client>=5.1.0` - Official HubSpot Python SDK (optional)

## Usage

### Starting the Application

#### Backend API:
```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python modules
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend with HubSpot Integration:
```bash
streamlit run hubspot_app.py --logger.level=debug
```

### Streamlit UI Features

#### Connection Management
1. Click "⚙️ Setup" in the sidebar
2. Enter your HubSpot Access Token
3. Click "✅ Connect to HubSpot"
4. Status indicator shows connection state

#### Search & Sync Workflow
1. Enter a search query (e.g., "coffee shops in Seattle")
2. Click "🔎 Search"
3. Review results in the table
4. Choose to:
   - **📤 Sync All** - Import all results to HubSpot
   - **📋 Select Leads** - Choose specific businesses to sync
5. Contacts are automatically created in HubSpot

#### Lead Management (Tab 2)
- **Create Single Lead** - Manually add a contact
- **Create Deal** - Create opportunities for leads

#### HubSpot Contacts (Tab 3)
- Search existing contacts in HubSpot
- View contact details

## API Endpoints

### Health & Connection

```
GET /api/v1/hubspot/status
```
Check HubSpot API connection status

**Response:**
```json
{
  "connected": true,
  "message": "Successfully connected to HubSpot"
}
```

### Lead Management

#### Create Single Lead
```
POST /api/v1/hubspot/leads
Content-Type: application/json

{
  "email": "john@business.com",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+1234567890",
  "company": "ABC Corp",
  "website": "https://example.com",
  "address": "123 Main St",
  "city": "New York",
  "business_type": "Technology"
}
```

#### Batch Create Leads
```
POST /api/v1/hubspot/leads/batch
Content-Type: application/json

{
  "leads": [
    {
      "email": "john@business.com",
      "firstname": "John",
      "lastname": "Doe",
      "company": "ABC Corp"
    },
    {
      "email": "jane@business.com",
      "firstname": "Jane",
      "lastname": "Smith",
      "company": "XYZ Inc"
    }
  ]
}
```

#### Upsert Lead (Create or Update)
```
POST /api/v1/hubspot/leads/upsert
Content-Type: application/json

{
  "email": "john@business.com",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+1234567890"
}
```

### Deal Management

#### Create Deal
```
POST /api/v1/hubspot/deals
Content-Type: application/json

{
  "dealname": "ABC Corp Lead",
  "dealstage": "negotiation",
  "amount": "50000",
  "description": "High-value prospect",
  "contact_id": "contact_123"
}
```

**Deal Stages:**
- `negotiation`
- `presentation_scheduled`
- `proposal_sent`
- `in_contract`
- `closed_won`
- `closed_lost`

### Contact Search

```
POST /api/v1/hubspot/contacts/search?query=john&limit=10
```

### Data Conversion

#### Convert Google Business to HubSpot Lead Format
```
POST /api/v1/hubspot/convert/google-to-hubspot
Content-Type: application/json

{
  "name": "John's Coffee Shop",
  "address": "123 Main St",
  "phone": "+1234567890",
  "website": "https://johnscoffee.com",
  "business_type": "Restaurant",
  "rating": 4.5,
  "review_count": 250
}
```

## Google Business to HubSpot Field Mapping

| Google Field | HubSpot Property | Notes |
|---|---|---|
| `name` | `firstname` + `lastname` | Split on first space |
| `address` | `address` | Full address |
| `phone` | `phone` | Contact phone |
| `website` | `website` | Business website |
| `business_type` | `lifecyclestage` | Type of business |
| `rating` | `hs_lead_status` | Star rating |
| `latitude` | `hs_analytics_latitude` | Location latitude |
| `longitude` | `hs_analytics_longitude` | Location longitude |

## Code Structure

```
app/
├── services/
│   ├── hubspot_service.py      # HubSpot API client
│   └── google_maps_service.py  # (existing)
├── models/
│   ├── hubspot.py               # HubSpot data models
│   └── business.py              # (existing)
├── schemas/
│   ├── hubspot.py               # Pydantic validation schemas
│   └── business.py              # (existing)
├── routes/
│   ├── hubspot.py               # HubSpot API endpoints
│   └── businesses.py            # (existing)
└── utils/
    └── hubspot_helper.py        # Streamlit helper functions

hubspot_app.py                   # Streamlit UI with HubSpot integration
tests/
├── test_hubspot.py              # HubSpot service tests
└── test_services.py             # (existing)
```

## Example Workflows

### Workflow 1: Find and Import Leads

```python
# 1. Search for businesses
"Find pizza restaurants in New York City"

# 2. Sync results to HubSpot
# Click "📤 Sync All to HubSpot"

# 3. Leads now appear in HubSpot Contacts

# 4. Create deals for qualified leads
# Use "Create Deal" form in Lead Management tab
```

### Workflow 2: Manual Lead Creation

```python
# 1. Go to "Lead Management" tab
# 2. Fill in lead form:
#    - Email (required)
#    - Name, Phone, Company, Website (optional)
# 3. Click "✅ Create Lead"
# 4. Lead is created and appears in HubSpot
```

### Workflow 3: Batch Import

```python
# Use API directly for larger imports
POST /api/v1/hubspot/leads/batch

# Or prepare a CSV and convert to batch format
# 100+ leads can be imported at once
```

## Error Handling

### Common Issues

#### "Invalid API Key"
- Verify token in `.env` file
- Check token hasn't expired
- Ensure token has required scopes

#### "Email is required"
- All leads must have an email address
- If Google result doesn't have email, system generates: `businessname@business.local`

#### "Connection Timeout"
- Check internet connection
- Verify API endpoint: `https://api.hubapi.com`
- Check firewall settings

## Advanced Configuration

### Custom Property Mapping

Edit `app/services/hubspot_service.py` in the `_map_to_hubspot_properties()` method:

```python
property_mapping = {
    "source_field": "hubspot_property",
    # Add custom mappings here
}
```

### Session Management

Store HubSpot connection in Streamlit session:

```python
st.session_state.hubspot_token = "your_token"
st.session_state.hubspot_connected = True
```

## Testing

Run unit tests:

```bash
pytest tests/test_hubspot.py -v
pytest tests/ -v  # Run all tests
```

## Security Best Practices

1. **Never commit secrets** - Use `.env` file (in `.gitignore`)
2. **Use environment variables** - Load from secure vaults in production
3. **Rotate tokens regularly** - Set expiration policies in HubSpot
4. **Use OAuth for user-facing apps** - Private apps for server-backend
5. **Validate input** - Use Pydantic schemas (already implemented)
6. **HTTPS only** - Use HTTPS in production
7. **Rate limiting** - Implement in production (HubSpot has rate limits)

## Marketplace Integration

To list this integration on HubSpot Marketplace:

1. **Prepare your app** - Follow this integration guide
2. **HubSpot Marketplace Portal** - [https://app.hubspot.com/marketplace](https://app.hubspot.com/marketplace)
3. **Submit for review** - Provide:
   - App description
   - Logo/screenshots
   - Documentation link
   - Support contact
4. **Approval process** - HubSpot reviews and approves

### Marketplace Requirements
- ✅ OAuth or API authentication
- ✅ Handles errors gracefully
- ✅ Rate limit handling
- ✅ Clear documentation
- ✅ Support contact available

## Performance Optimization

### Batch Operations
- Import 100+ leads at once using batch endpoints
- Reduces API calls by 100x
- Improves performance significantly

### Caching
```python
# Cache HubSpot service instance
@st.cache_resource
def get_hubspot_service():
    return HubSpotService()
```

### Pagination
```python
# Get contacts with pagination
contacts = hubspot.get_contacts(limit=50, after="page_token")
```

## Contributing

To contribute improvements:

1. Create a feature branch
2. Add tests for new functionality
3. Update documentation
4. Submit pull request

## Support & Troubleshooting

For issues:
1. Check [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
2. Review error messages in logs
3. Verify API credentials
4. Check rate limits

## Additional Resources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot Python SDK](https://github.com/HubSpot/hubspot-api-python)
- [HubSpot Community](https://community.hubspot.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Streamlit Documentation](https://docs.streamlit.io)

## License

[Your License Here]

## Version History

### v1.0.0 (Current)
- Initial HubSpot integration
- Streamlit UI with connection management
- Batch lead import capability
- Deal creation
- Contact search

---

**Last Updated:** February 2026
**Maintainer:** Lead Generation Team

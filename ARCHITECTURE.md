# Architecture & Data Flow Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Streamlit App (hubspot_app.py)                                 │
│  ├─ Tab 1: Search & Sync Interface                              │
│  ├─ Tab 2: Lead & Deal Management                              │
│  ├─ Tab 3: HubSpot Contact Search                              │
│  └─ Sidebar: Connection Management                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                      HTTP (REST)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼─────────────────┐   ┌──────────────▼────────────────┐
│  BACKEND API LAYER      │   │  HELPER LAYER               │
│  (FastAPI)              │   │  HubSpotStreamlitHelper     │
│                         │   │  (app/utils/)              │
│  app/main.py            │   └────────┬────────────────────┘
│  ├─ /health             │            │
│  ├─ /api/v1/           │            │ Wrapper/Translation
│  │  ├─ /businesses/*    │            │
│  │  └─ /hubspot/*       │            │
│  └─ Swagger Docs: /docs │            │
└──────────────┬──────────┘            │
               │                       │
               │ Routes              │
               ├─────────────────────┘
               │
    ┌──────────┴────────────┐
    │                       │
┌───▼─────────────────┐  ┌──▼────────────────────┐
│ BUSINESS ROUTES     │  │ HUBSPOT ROUTES       │
│ (app/routes/)       │  │ (app/routes/        │
│                     │  │  hubspot.py)         │
│ search_businesses() │  │ create_lead()       │
│ get_business()      │  │ create_batch_leads()│
└─────────┬───────────┘  │ create_deal()       │
          │              │ search_contacts()    │
          │              │ upsert_lead()       │
          │              └──┬─────────────────┘
          │                 │
    ┌─────▼──────────────────▼──────────────────┐
    │         SERVICE LAYER                     │
    │       (app/services/)                     │
    │  ┌─────────────────────────────────────┐ │
    │  │ GoogleMapsService                   │ │
    │  │ - search_nearby_businesses()        │ │
    │  │ - get_place_details()               │ │
    │  └─────────────────────────────────────┘ │
    │  ┌─────────────────────────────────────┐ │
    │  │ HubSpotService                      │ │
    │  │ - verify_connection()               │ │
    │  │ - create_lead()                     │ │
    │  │ - batch_create_leads()              │ │
    │  │ - create_deal()                     │ │
    │  │ - search_contacts()                 │ │
    │  │ - _map_to_hubspot_properties()      │ │
    │  └─────────────────────────────────────┘ │
    └──────────────┬──────────────────┬────────┘
                   │                  │
         ┌─────────▼──┐        ┌──────▼─────────┐
         │  API KEYS  │        │   MODELS       │
         │  CONFIG    │        │  (app/models/) │
         │            │        │                │
         │ .env file  │        │ Business       │
         │ Settings   │        │ HubSpotLead    │
         │            │        │ HubSpotDeal    │
         └──────┬──────┘        │ HubSpotAuth    │
                │               └────────────────┘
           ┌────▼──────────────────────────────────┐
           │    VALIDATION LAYER                  │
           │     (app/schemas/)                   │
           │  ├─ Pydantic Models                  │
           │  ├─ Input Validation                 │
           │  ├─ Type Checking                    │
           │  └─ Error Messages                   │
           └────┬──────────────────────────────────┘
                │
         ┌──────▼──────────────────────────────────┐
         │       EXTERNAL APIs                    │
         │                                        │
         │ ┌────────────────────────────────────┐ │
         │ │ Google Maps API                    │ │
         │ │ https://places.googleapis.com      │ │
         │ │ - searchText endpoint              │ │
         │ │ - getDetails endpoint              │ │
         │ └────────────────────────────────────┘ │
         │                                        │
         │ ┌────────────────────────────────────┐ │
         │ │ HubSpot API                       │ │
         │ │ https://api.hubapi.com            │ │
         │ │ - /crm/v3/objects/contacts        │ │
         │ │ - /crm/v3/objects/deals           │ │
         │ └────────────────────────────────────┘ │
         └────────────────────────────────────────┘
```

## Data Flow: Search to HubSpot Sync

```
User Interface
    │
    │ "Search query: coffee shops in Seattle"
    │
    ▼
┌─────────────────────────────────────────────┐
│  Streamlit Frontend (hubspot_app.py)        │
│  ├─ Validates input                         │
│  └─ Shows loading spinner                   │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP POST
               │ /api/v1/businesses/search
               │ ?query=...&max_results=...
               ▼
┌─────────────────────────────────────────────┐
│  FastAPI - Business Routes                  │
│  ├─ Parse query parameters                  │
│  └─ Call GoogleMapsService                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  GoogleMapsService                          │
│  ├─ Format search query                     │
│  ├─ Call Google Places API                  │
│  └─ Parse results                          │
└──────────────┬──────────────────────────────┘
               │
               ▼ HTTP to Google
         ┌────────────────┐
         │ Google APIs    │
         │ Places API v1  │
         └────────┬───────┘
                  │
                  │ Results with:
                  │ - name
                  │ - address
                  │ - rating
                  │ - website
                  │ - business_type
                  │ - coordinates
                  ▼
┌─────────────────────────────────────────────┐
│  GoogleMapsService                          │
│  ├─ Map to Business objects                 │
│  └─ Return to routes                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  FastAPI - Return Results                   │
│  ├─ Convert to JSON                         │
│  └─ HTTP 200 response                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Streamlit Frontend                         │
│  ├─ Parse response                          │
│  ├─ Display in table                        │
│  └─ Show action buttons                     │
└──────────────┬──────────────────────────────┘
               │
               │ User clicks "Sync All to HubSpot"
               │
               ▼
┌─────────────────────────────────────────────┐
│  Streamlit                                  │
│  ├─ For each business:                      │
│  │  ├─ Generate email (if missing)         │
│  │  ├─ Create lead dict                    │
│  │  └─ Add to leads array                  │
│  └─ Show progress="Syncing..."             │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP POST
               │ /api/v1/hubspot/leads/batch
               │ {"leads": [...]}
               ▼
┌─────────────────────────────────────────────┐
│  FastAPI - HubSpot Routes                   │
│  ├─ Validate batch schema                   │
│  ├─ Create payload for HubSpot              │
│  └─ Call HubSpotService                     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  HubSpotService                             │
│  ├─ For each lead:                          │
│  │  ├─ Map to HubSpot properties            │
│  │  └─ Create property list                 │
│  ├─ Create batch request payload            │
│  └─ POST to HubSpot API                     │
└──────────────┬──────────────────────────────┘
               │
               ▼ HTTPS to HubSpot
         ┌────────────────────────┐
         │ HubSpot API            │
         │ /crm/v3/objects/       │
         │  contacts/batch/create │
         └────────┬───────────────┘
                  │
                  │ For each lead:
                  │ - Create contact
                  │ - Assign properties
                  │ - Return contact ID
                  ▼
┌─────────────────────────────────────────────┐
│  HubSpotService                             │
│  ├─ Parse response                          │
│  ├─ Extract created contact IDs             │
│  └─ Return success result                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  FastAPI - HubSpot Routes                   │
│  ├─ Create success response                 │
│  └─ HTTP 200 with results                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Streamlit Frontend                         │
│  ├─ Parse success response                  │
│  ├─ Show success message                    │
│  ├─ Display balloons animation             │
│  └─ Update leads in HubSpot                │
└──────────────────────────────────────────────┘
```

## Data Model Relationships

```
┌──────────────────────────┐
│   Google Business        │
│                          │
│ name: str                │
│ address: str             │
│ latitude: float          │
│ longitude: float         │
│ phone: str (optional)    │
│ website: str (optional)  │
│ rating: float (optional) │
│ review_count: int        │
└────────────┬─────────────┘
             │
             │ Convert
             │ (HubSpotStreamlitHelper)
             ▼
┌──────────────────────────────┐
│   HubSpotLead               │
│                              │
│ email: str ⭐ REQUIRED       │
│ firstname: str               │
│ lastname: str                │
│ phone: str                   │
│ company: str                 │
│ website: str                 │
│ address: str                 │
│ city: str                    │
│ state: str                   │
│ business_type: str           │
│ rating: float                │
│ latitude: float              │
│ longitude: float             │
└────────────┬────────────────┘
             │
             │ Create in HubSpot
             │
             ▼
┌──────────────────────────────┐
│   HubSpot Contact            │
│   (crm/v3/objects/contacts)  │
│                              │
│ id: string ⭐ AUTO           │
│ properties: { ... }          │
│   - firstname                │
│   - lastname                 │
│   - email                    │
│   - phone                    │
│   - company                  │
│   - website                  │
│   - lifecyclestage           │
│   - hs_lead_status           │
└──────────────┬───────────────┘
               │
               │ Optional:
               │ Create Deal
               │
               ▼
┌──────────────────────────────┐
│   HubSpot Deal               │
│   (crm/v3/objects/deals)     │
│                              │
│ id: string ⭐ AUTO           │
│ properties: { ... }          │
│   - dealname                 │
│   - dealstage                │
│   - amount                   │
│   - description              │
│                              │
│ Associated with Contact      │
└──────────────────────────────┘
```

## Configuration & Secrets Flow

```
┌─────────────────────────────────┐
│  .env File (Local - .gitignored)│
│                                 │
│ HUBSPOT_API_KEY=pat-na1-xxx    │
│ GOOGLE_MAPS_API_KEY=AIzaSy...  │
│ DEBUG=True                      │
└────────────┬────────────────────┘
             │
             │ Load on startup
             │
             ▼
┌──────────────────────────────────┐
│  app/config.py (Settings class)  │
│                                  │
│  - HUBSPOT_API_KEY              │
│  - GOOGLE_MAPS_API_KEY          │
│  - HUBSPOT_OAUTH_CLIENT_ID      │
│  - HUBSPOT_OAUTH_CLIENT_SECRET  │
│  - DEBUG                         │
│  - APP_NAME                      │
│  - APP_VERSION                   │
└────────────┬─────────────────────┘
             │
             │ Injected into:
             │
    ┌────────┴────────┬──────────────┐
    │                 │              │
    ▼                 ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ HubSpot    │ │ GoogleMaps │ │ FastAPI    │
│ Service    │ │ Service    │ │ App        │
└────────────┘ └────────────┘ └────────────┘
```

## API Request/Response Examples

### Search Businesses

**Request:**
```
GET /api/v1/businesses/search
?query=coffee shops in Seattle
&max_results=10
```

**Response:**
```json
{
  "results": [
    {
      "name": "Espresso Express",
      "address": "123 Pike St, Seattle, WA",
      "phone": "+1-206-555-0100",
      "website": "https://espresso-express.com",
      "business_type": "Cafe",
      "rating": 4.8,
      "review_count": 256,
      "latitude": 47.6100,
      "longitude": -122.3312
    }
  ]
}
```

### Batch Sync to HubSpot

**Request:**
```json
POST /api/v1/hubspot/leads/batch
{
  "leads": [
    {
      "email": "espresso.express@business.local",
      "firstname": "Espresso",
      "lastname": "Express",
      "phone": "+1-206-555-0100",
      "company": "Espresso Express",
      "website": "https://espresso-express.com",
      "address": "123 Pike St, Seattle, WA",
      "business_type": "Cafe",
      "rating": 4.8
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 1,
  "created": 1,
  "message": "Successfully created 1 contacts",
  "data": {
    "results": [
      {
        "id": "contact-123456",
        "properties": {
          "firstname": "Espresso",
          "lastname": "Express",
          "email": "espresso.express@business.local"
        }
      }
    ]
  }
}
```

## Error Handling Flow

```
┌──────────────────────────────────┐
│  Request arrives at endpoint     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Pydantic Schema Validation      │
│  ├─ Type checking                │
│  ├─ Email validation             │
│  └─ Required field check         │
└─────┬──────────────────────┬──────┘
      │                      │
    PASS                   FAIL
      │                      │
      ▼                      ▼
┌──────────────┐   ┌─────────────────────┐
│  Service     │   │ Return 422          │
│  Processing  │   │ ValidationError     │
└─────┬────────┘   └─────────────────────┘
      │
      ▼
┌──────────────────────────────────┐
│  External API Call               │
│  (Google or HubSpot)             │
└─────┬──────────────────────┬──────┘
    SUCCESS                 ERROR
      │                      │
      ▼                      ▼
┌──────────────┐   ┌──────────────────────┐
│  Parse       │   │ Catch Exception      │
│  Response    │   │ ├─ Timeout          │
│  ├─ Extract  │   │ ├─ Invalid JSON     │
│  └─ Map data │   │ ├─ Network error    │
└─────┬────────┘   │ └─ Auth error       │
      │            └──────┬──────────────┘
      ▼                    │
┌──────────────────────────▼─────────────┐
│  Return Result                          │
│  ├─ Success: {"success": true, ...}   │
│  └─ Error: HTTPException or Response   │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  Streamlit Frontend                     │
│  ├─ Check success flag                  │
│  ├─ Show success: st.success()          │
│  └─ Show error: st.error()              │
└─────────────────────────────────────────┘
```

## Testing Architecture

```
┌──────────────────────────────────────┐
│  tests/test_hubspot.py               │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │  TestHubSpotService            │ │
│  │  ├─ test_verify_connection()   │ │
│  │  ├─ test_create_lead()         │ │
│  │  ├─ test_batch_leads()         │ │
│  │  └─ test_mapping()             │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  TestHubSpotModels             │ │
│  │  ├─ test_lead_to_dict()        │ │
│  │  └─ test_deal_to_dict()        │ │
│  └────────────────────────────────┘ │
│                                      │
│  Mock Objects:                       │
│  ├─ requests.get → Mock              │
│  ├─ requests.post → Mock             │
│  └─ API responses → Predefined       │
└──────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            HEROKU CLOUD PLATFORM                     │ │
│  │  or AWS/Azure/GCP or Self-hosted                     │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │  FastAPI Backend Container                     │ │ │
│  │  │  (uvicorn app.main:app)                        │ │ │
│  │  │                                                │ │ │
│  │  │  Routes:                                       │ │ │
│  │  │  ├─ /health                                    │ │ │
│  │  │  ├─ /docs (Swagger)                            │ │ │
│  │  │  ├─ /api/v1/businesses/*                       │ │ │
│  │  │  └─ /api/v1/hubspot/*                          │ │ │
│  │  │                                                │ │ │
│  │  │  Environment Variables (from secrets):         │ │ │
│  │  │  ├─ HUBSPOT_API_KEY                            │ │ │
│  │  │  ├─ GOOGLE_MAPS_API_KEY                        │ │ │
│  │  │  └─ DEBUG=False                                │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │                                                      │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │  Streamlit Frontend (Optional)                  │ │ │
│  │  │  (streamlit run hubspot_app.py)                 │ │ │
│  │  │                                                │ │ │
│  │  │  Connects to:                                  │ │ │
│  │  │  └─ Backend: https://api.yourdomain.com        │ │ │
│  │  │                                                │ │ │
│  │  │  Secrets:                                      │ │ │
│  │  │  └─ Streamlit secrets.toml                     │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  External Services (HTTPS):                               │
│  ├─ HubSpot API (api.hubapi.com)                          │
│  └─ Google Maps API (places.googleapis.com)               │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Easy testing
- ✅ Scalability
- ✅ Security
- ✅ Maintainability

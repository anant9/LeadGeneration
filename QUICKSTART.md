# Lead Generation with Multi-CRM Integration

🚀 A modern lead generation platform with support for HubSpot, Zoho, and Salesforce CRM integrations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lead Generation Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐           ┌────────────────────────┐  │
│  │   Next.js Frontend   │◄─────────►│   FastAPI Backend      │  │
│  │   (Port 3000)        │   REST    │   (Port 8000)          │  │
│  │                      │   APIs    │                        │  │
│  │  • Search UI         │           │  • Business Search     │  │
│  │  • Lead Manager      │           │  • Rate Limiting       │  │
│  │  • CRM Connector     │           │  • CRM Services        │  │
│  └──────────────────────┘           └────────────────────────┘  │
│                                             │                    │
│                                             ├─► HubSpot API     │
│                                             ├─► Zoho API        │
│                                             ├─► Salesforce API  │
│                                             └─► Google Maps API │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- API Keys:
  - Google Maps API Key
  - HubSpot/Zoho/Salesforce credentials (optional)

### 1. Start Backend (FastAPI)

```bash
# From project root
cd .

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add your API keys
# (GOOGLE_MAPS_API_KEY, etc.)

# Run the server
python run.py
# or with uvicorn directly:
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: **http://localhost:8000**

#### Backend API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### Verify Backend is Running
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "app": "Lead Generation API"}
```

### 2. Start Frontend (Next.js)

In a **new terminal/shell**:

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## How to Use

### 1. Open the App
Go to http://localhost:3000 in your browser

### 2. Search Businesses
- Navigate to "Search Businesses" tab
- Enter a natural language query (e.g., "coffee shops in NYC")
- Results are limited to: 3 searches/day, 5 results per search (anonymous)
- Note: IP-based rate limiting is enforced

### 3. Connect to CRM
- Go to "CRM Connection" tab
- Select your CRM provider (HubSpot, Zoho, or Salesforce)
- Enter your API token/credentials
- Click "Connect to [PROVIDER]"

### 4. Sync Leads
- Search for businesses
- Click "Sync All" to sync all results to CRM
- Or select specific businesses and click "Sync Selected"

### 5. Manage Leads & Deals
- Go to "Lead Management" tab
- Create individual leads manually
- Create deals and assign to contacts

### 6. Search Contacts
- Go to "Contacts" tab
- Search existing contacts in your CRM

## Features

### 🔍 **Business Search**
- Natural language search queries
- Integration with Google Maps API
- Anonymous search with daily rate limits
- Bulk lead sync to CRM

### 🔐 **CRM Integrations**
- **HubSpot**: Contacts, deals, batch operations
- **Zoho**: Leads, contacts, deals
- **Salesforce**: Contacts (Leads), opportunities (Deals)
- Easy provider switching

### 🛡️ **Security Features**
- IP-based rate limiting (SQLite)
- IP whitelist support for local dev
- Admin bypass token support
- Anonymous access for validation

### 📊 **Backend Services**
- Google Maps Places API integration
- Business geocoding & search
- Batch lead creation
- Lead upsert (create or update)

## Configuration

### Backend (.env)
```env
# Google Maps
GOOGLE_MAPS_API_KEY=your_key_here

# HubSpot
HUBSPOT_API_KEY=pat-na1-xxxxxxx

# Zoho
ZOHO_ACCESS_TOKEN=your_token
ZOHO_BASE_URL=https://www.zohoapis.com/crm/v2

# Salesforce
SALESFORCE_ACCESS_TOKEN=your_token
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
SALESFORCE_API_VERSION=52.0

# Rate Limiting
IP_WHITELIST=127.0.0.1,::1
ADMIN_BYPASS_TOKEN=your_admin_token

# Server
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Testing the System

### Test Anonymous Search (No Auth)
```bash
# From any shell
curl "http://localhost:8000/api/v1/search/natural?query=pizza+restaurants&max_results=5"
```

### Test with Admin Bypass Token
```bash
curl "http://localhost:8000/api/v1/search/natural?query=pizza+restaurants&max_results=5" \
  -H "x-admin-bypass-token: your_admin_token"
```

### Check Rate Limit (IP-based)
```bash
# Try 4 searches from same IP - 4th should fail with 429
for i in {1..4}; do
  curl "http://localhost:8000/api/v1/search/natural?query=coffee" 
done
```

## Project Structure

```
LeadGeneration/
├── app/                      # Backend FastAPI app
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Settings
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   │   ├── businesses.py
│   │   ├── hubspot.py
│   │   ├── zoho.py
│   │   └── salesforce.py
│   ├── services/            # Business logic
│   │   ├── google_maps_service.py
│   │   ├── hubspot_service.py
│   │   ├── zoho_service.py
│   │   └── salesforce_service.py
│   ├── schemas/             # Pydantic models
│   └── utils/               # Utilities
│       ├── ip_rate_limiter.py
│       └── crm_helper.py
├── frontend/                 # Next.js frontend
│   ├── pages/               # Page components
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities & API client
│   └── styles/              # CSS
├── tests/                   # Backend tests
├── requirements.txt         # Python dependencies
├── run.py                   # Backend entry script
└── README.md
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Try different port
uvicorn app.main:app --port 8001
```

### Frontend Can't Connect to Backend
- Ensure backend is running: `http://localhost:8000/health`
- Check CORS settings (backend enables all origins)
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Rate Limit Blocking Me
```bash
# Reset rate limiter database
rm ip_rate_limiter.sqlite

# Or skip limit with admin token in .env
# Then use header:
# x-admin-bypass-token: your_token
```

### Python Dependency Issues
```bash
# Clear cache and reinstall
pip cache purge
pip install -r requirements.txt --force-reinstall
```

## Development Guidelines

### Adding a New CRM Provider
1. Create `app/services/provider_service.py`
2. Create `app/routes/provider.py`
3. Register router in `app/main.py`
4. Create `app/models/provider.py` (optional)
5. Update frontend API client in `frontend/lib/api.ts`

### Adding a New Frontend Page
1. Create file in `frontend/pages/new-page.tsx`
2. Use `LayoutWrapper` component for consistency
3. Import and use API functions from `frontend/lib/api.ts`
4. Use Zustand store for state: `useAppStore`

## Performance Tips

### Backend
- Use admin bypass token to skip rate limiting during dev
- Index the SQLite database for faster lookups
- Cache Google Maps API responses

### Frontend
- Use Next.js Image component for images
- Implement query pagination for large result sets
- Add SWR/React Query for data fetching with caching

## Future Enhancements

- [ ] OAuth flows for Zoho & Salesforce
- [ ] Webhook support for real-time sync
- [ ] Analytics dashboard
- [ ] Bulk import from CSV
- [ ] Contact deduplication
- [ ] Lead scoring
- [ ] Campaign management
- [ ] Email integration

## API Reference

### Public Endpoints
```
GET  /health                          # Health check
GET  /api/v1/search/natural           # Search businesses (rate-limited)
GET  /api/v1/search/by-address        # Search by address
POST /api/v1/search                   # Search with coordinates

GET  /api/v1/{provider}/status        # Check CRM connection
POST /api/v1/{provider}/connection    # Set CRM credentials
POST /api/v1/{provider}/leads         # Create lead
POST /api/v1/{provider}/leads/batch   # Batch create leads
POST /api/v1/{provider}/leads/upsert  # Create or update lead
POST /api/v1/{provider}/deals         # Create deal
```

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API docs at http://localhost:8000/docs
3. Check frontend logs in browser console
4. Check backend logs in terminal

---

**Happy lead generating! 🚀**

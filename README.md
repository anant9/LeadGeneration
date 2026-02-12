# Lead Generation Platform

🚀 A modern, full-stack lead generation platform with business search, multi-CRM integration (HubSpot, Zoho, Salesforce), and an intuitive Next.js frontend.

## Features

### 🔍 **Business Search**
- Natural language queries ("coffee shops in NYC")
- Address-based search
- Coordinate-based search
- Powered by Google Maps API
- **Anonymous access**: 3 searches/day, 5 results max (IP-based rate limiting)

### 🔐 **Multi-CRM Integration**
- **HubSpot**: Contacts, deals, batch operations
- **Zoho CRM**: Leads, contacts, deals
- **Salesforce**: Contacts (Leads), opportunities (Deals)
- Easy provider switching without reconnecting

### 🛡️ **Security & Rate Limiting**
- IP-based rate limiting (SQLite-backed)
- IP whitelist for development
- Admin bypass token support
- CORS enabled for frontend

### 📱 **Modern Frontend**
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Responsive** design
- Real-time message notifications

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Maps API Key
- (Optional) HubSpot/Zoho/Salesforce credentials

### Installation

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env and add your API keys
```

### Run Everything at Once

```bash
python run.py
```

This single command starts:
- ✅ **FastAPI Backend** on http://localhost:8000
- ✅ **Next.js Frontend** on http://localhost:3000

Then open http://localhost:3000 in your browser!

### Or Run Services Separately

**Backend only:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## Project Structure

```
LeadGeneration/
├── app/                         # Backend (FastAPI)
│   ├── main.py                  # FastAPI app
│   ├── config.py                # Settings
│   ├── models/                  # Data models
│   ├── routes/                  # API routes
│   │   ├── businesses.py        # Search endpoints
│   │   ├── hubspot.py           # HubSpot CRM routes
│   │   ├── zoho.py              # Zoho CRM routes
│   │   └── salesforce.py        # Salesforce routes
│   ├── services/                # Business logic
│   │   ├── google_maps_service.py
│   │   ├── hubspot_service.py
│   │   ├── zoho_service.py
│   │   └── salesforce_service.py
│   ├── schemas/                 # Pydantic models
│   └── utils/                   # Utilities
│       ├── ip_rate_limiter.py
│       └── crm_helper.py
│
├── frontend/                    # Frontend (Next.js)
│   ├── pages/                   # Pages (Search, Connection, Leads, Contacts)
│   ├── components/              # Reusable UI components
│   ├── lib/                     # API client & Zustand store
│   ├── styles/                  # Global styles
│   └── package.json
│
├── tests/                       # Backend tests
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
└── run.py                       # Universal launcher
```

## Configuration

### Backend (.env)
```env
# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

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
ADMIN_BYPASS_TOKEN=dev_admin_token_123

# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Health Check
```
GET /health
```

### Public Search Endpoints
```
GET  /api/v1/search/natural?query=coffee&max_results=5
GET  /api/v1/search/by-address?address=NYC&business_type=restaurant
POST /api/v1/search
```

### CRM Endpoints
```
GET  /api/v1/{provider}/status
POST /api/v1/{provider}/leads
POST /api/v1/{provider}/leads/batch
POST /api/v1/{provider}/deals
```

Providers: `hubspot`, `zoho`, `salesforce`

## Testing

```bash
pytest tests/
```

## Development

All changes auto-reload in both backend and frontend:
- Backend: FastAPI reload via uvicorn
- Frontend: Next.js hot-reload

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux
```

### Frontend Can't Connect to Backend
- Ensure `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `.env.local`
- Check backend is running: http://localhost:8000/health

### Rate Limit Issues
- Use admin bypass token in header: `x-admin-bypass-token: your_token`
- Or add IP to `IP_WHITELIST` in `.env`

## Future Enhancements

- [ ] OAuth flows for Zoho/Salesforce
- [ ] Admin analytics dashboard
- [ ] Webhook integrations
- [ ] Bulk CSV import
- [ ] Contact deduplication
- [ ] Lead scoring ML model
- [ ] Campaign management

## License

MIT License

## Support

1. Check QUICKSTART.md for detailed setup
2. Review API docs at http://localhost:8000/docs
3. Check browser console for frontend errors
4. Check terminal for backend errors

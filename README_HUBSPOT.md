# Lead Generation with HubSpot CRM Integration

A powerful lead generation platform that searches for businesses and automatically syncs them to **HubSpot CRM**. Built with FastAPI, Streamlit, and Google Maps integration.

## 🌟 Key Features

### 🔍 Smart Business Search
- Search businesses by location and type using Google Maps API
- Get detailed information: ratings, reviews, contact details, website
- Filter and view results in an interactive table

### 📤 Automatic HubSpot Sync
- **One-click sync** - Send all search results to HubSpot
- **Selective sync** - Choose specific businesses to import
- **Batch import** - Add 100+ leads at once
- **Upsert capability** - Automatically update existing contacts

### 🤝 Deal Management
- Create opportunities in HubSpot directly from the app
- Convert leads to deals with deal stages
- Track opportunity values and pipeline

### 📊 Contact Management
- Search existing HubSpot contacts
- View and manage contact details
- Create and update leads in real-time

### 🔐 Enterprise-Grade Security
- OAuth and Private App token support
- Secure credential management
- No hardcoded secrets
- Full input validation

## 🚀 Quick Start (5 Minutes)

### 1️⃣ Get HubSpot API Key
```
Visit: https://app.hubspot.com/l/settings/apps/private-apps
→ Create private app
→ Enable: contacts.read, contacts.write, deals.read, deals.write
→ Copy your access token
```

### 2️⃣ Setup Environment
```bash
# Clone or navigate to project
cd LeadGeneration

# Copy configuration template
cp .env.example .env

# Edit .env with your keys
# HUBSPOT_API_KEY=pat-na1-your-token-here
# GOOGLE_MAPS_API_KEY=your-google-key
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Start Backend
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 5️⃣ Start Frontend
```bash
# In another terminal
streamlit run hubspot_app.py
```

### 6️⃣ Connect in UI
- Open: http://localhost:8501
- Click "⚙️ Setup" → Paste token → Click "✅ Connect to HubSpot"
- Done! 🎉

## 📦 What's Included

### New Components (HubSpot Integration)

```
app/
├── services/
│   └── hubspot_service.py          # HubSpot API client
├── models/
│   └── hubspot.py                  # Data models
├── schemas/
│   └── hubspot.py                  # Validation schemas
├── routes/
│   └── hubspot.py                  # API endpoints
└── utils/
    └── hubspot_helper.py           # Streamlit helpers

hubspot_app.py                       # Main Streamlit UI
tests/test_hubspot.py               # Unit tests

Documentation:
├── QUICKSTART_HUBSPOT.md           # 5-min setup
├── HUBSPOT_INTEGRATION.md          # Complete reference
├── MARKETPLACE_SUBMISSION.md       # Publishing guide
├── ARCHITECTURE.md                 # System design
├── IMPLEMENTATION_SUMMARY.md       # What was built
└── VERIFICATION_CHECKLIST.md       # Setup verification
```

### Existing Components
- Google Maps business search
- FastAPI backend
- Original Streamlit app

## 💡 Usage Examples

### Example 1: Search and Sync
```
1. Enter: "coffee shops in Seattle"
2. See 15+ results with ratings
3. Click "📤 Sync All to HubSpot"
4. All contacts created in HubSpot CRM
5. Ready for follow-up!
```

### Example 2: Selective Import
```
1. Search returns 50 results
2. Click "📋 Select Leads" 
3. Choose top 10 highest-rated shops
4. Click "📤 Sync Selected Leads"
5. Import only your best prospects
```

### Example 3: API Integration
```bash
# Create single lead
curl -X POST http://localhost:8000/api/v1/hubspot/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@business.com",
    "firstname": "John",
    "company": "ABC Corp"
  }'

# Batch import 100 leads
curl -X POST http://localhost:8000/api/v1/hubspot/leads/batch \
  -H "Content-Type: application/json" \
  -d '{"leads": [...]}'
```

## 🔌 API Endpoints

| Endpoint | Method | Feature |
|----------|--------|---------|
| `/api/v1/hubspot/status` | GET | Check connection |
| `/api/v1/hubspot/leads` | POST | Create single lead |
| `/api/v1/hubspot/leads/batch` | POST | Batch import |
| `/api/v1/hubspot/leads/upsert` | POST | Create or update |
| `/api/v1/hubspot/deals` | POST | Create deal |
| `/api/v1/hubspot/contacts/search` | POST | Search contacts |
| `/api/v1/hubspot/connection` | POST | Update credentials |

**Full API Docs:** http://localhost:8000/docs (when running)

## 📚 Documentation

### For Quick Setup
👉 Start here: [QUICKSTART_HUBSPOT.md](QUICKSTART_HUBSPOT.md)

### For Complete Reference
👉 Full guide: [HUBSPOT_INTEGRATION.md](HUBSPOT_INTEGRATION.md)

### For Marketplace Publishing
👉 Publishing guide: [MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md)

### For System Architecture
👉 Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

### For Implementation Details
👉 Summary: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### For Setup Verification
👉 Checklist: [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

## 🧪 Testing

```bash
# Run HubSpot tests
pytest tests/test_hubspot.py -v

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app
```

## 🔒 Security Features

✅ **No Hardcoded Secrets** - All configs via environment variables
✅ **Input Validation** - Pydantic schemas validate all inputs
✅ **Error Handling** - Graceful error messages, no info leaks
✅ **Secure Credentials** - `.env` excluded from git
✅ **CORS Configured** - Proper cross-origin handling
✅ **Token Management** - Supports OAuth and private apps

## 🌐 Deployment

### Local Development
```bash
python -m uvicorn app.main:app --reload
streamlit run hubspot_app.py
```

### Heroku
```bash
heroku create your-app-name
heroku config:set HUBSPOT_API_KEY=your_key
git push heroku main
```

### Docker
```bash
docker build -t lead-gen-hubspot .
docker run -p 8000:8000 -e HUBSPOT_API_KEY=your_key lead-gen-hubspot
```

### Streamlit Cloud
Push to GitHub, connect via [share.streamlit.io](https://share.streamlit.io)

## 📋 Configuration

### Required Variables
```env
HUBSPOT_API_KEY=pat-na1-xxxxxxxxxxxxx        # HubSpot Private App Token
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxx      # Google Maps API Key
```

### Optional Variables
```env
DEBUG=True                                    # Debug mode
HUBSPOT_REDIRECT_URI=http://localhost:8000  # OAuth redirect
SEARCH_RADIUS=5000                          # Search radius (meters)
MAX_RESULTS=50                              # Max search results
```

See [.env.example](.env.example) for all options

## 🏗️ Architecture

The system uses a layered architecture:

```
Streamlit UI (hubspot_app.py)
    ↓
FastAPI Backend (app/main.py)
    ↓
Service Layer (hubspot_service.py, google_maps_service.py)
    ↓
External APIs (HubSpot, Google Maps)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams

## 🔄 Data Flow

1. **Search** - User searches for businesses
2. **Results** - Display businesses in table
3. **Selection** - Choose businesses to sync
4. **Conversion** - Convert search results to HubSpot format
5. **Sync** - Send to HubSpot API
6. **Confirmation** - Show success message with contact IDs

See [ARCHITECTURE.md](ARCHITECTURE.md) for data flow diagrams

## 📊 Features Matrix

| Feature | Type | Status |
|---------|------|--------|
| Google business search | Core | ✅ |
| Business filtering | Core | ✅ |
| Table view | UI | ✅ |
| Single lead creation | HubSpot | ✅ |
| Batch lead import | HubSpot | ✅ |
| Lead upsert | HubSpot | ✅ |
| Deal creation | HubSpot | ✅ |
| Contact search | HubSpot | ✅ |
| Deal associations | HubSpot | ✅ |
| OAuth support | Auth | ✅ |
| Private app support | Auth | ✅ |
| Connection management | UI | ✅ |
| Error handling | System | ✅ |
| Unit tests | QA | ✅ |
| Documentation | Support | ✅ |

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot import" | Check virtual environment is activated |
| "API key not found" | Verify `.env` exists and has credentials |
| "Connection refused" | Ensure backend is running on port 8000 |
| "Invalid API key" | Check token copied correctly from HubSpot |
| "Blank Streamlit page" | Verify backend is accessible, check browser console |
| "Email required error" | All leads need email - system generates if missing |

See [HUBSPOT_INTEGRATION.md](HUBSPOT_INTEGRATION.md#troubleshooting) for more

## 📈 Performance

- **Search:** < 5 seconds
- **Single lead sync:** < 2 seconds  
- **Batch sync (100 leads):** < 10 seconds
- **Concurrent requests:** Supported

## 🌍 HubSpot Marketplace

This integration is ready to publish to HubSpot Marketplace!

See [MARKETPLACE_SUBMISSION.md](MARKETPLACE_SUBMISSION.md) for:
- Marketplace requirements
- Deployment checklist
- Testing procedures
- Submission process
- Post-launch maintenance

## 📞 Support

**Quick Questions?**
- Check [QUICKSTART_HUBSPOT.md](QUICKSTART_HUBSPOT.md)

**Need Details?**
- Read [HUBSPOT_INTEGRATION.md](HUBSPOT_INTEGRATION.md)

**API Documentation?**
- Visit http://localhost:8000/docs

**HubSpot Help?**
- Check [HubSpot Docs](https://developers.hubspot.com/docs)

**Setup Issues?**
- Use [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

## 📄 License

[Add your license here]

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 🎯 Roadmap

- [ ] Webhooks for real-time sync
- [ ] Advanced filtering and saved searches
- [ ] Custom field mapping
- [ ] Deal pipeline automation
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Database caching

## 📝 Version History

### v1.0.0 (Current)
- ✅ Initial HubSpot integration
- ✅ Streamlit UI with connection management
- ✅ Batch lead import
- ✅ Deal creation
- ✅ Contact search
- ✅ Comprehensive documentation
- ✅ Unit tests

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com)
- Frontend with [Streamlit](https://streamlit.io)
- Business search via [Google Maps API](https://developers.google.com/maps)
- CRM integration with [HubSpot API](https://developers.hubspot.com)

---

## 🚀 Get Started Now!

1. Read [QUICKSTART_HUBSPOT.md](QUICKSTART_HUBSPOT.md) (5 minutes)
2. Set up your environment
3. Connect to HubSpot
4. Search and sync your first leads! 🎉

**Have questions?** Check the [complete documentation](HUBSPOT_INTEGRATION.md) or review [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) for setup help.

---

**Made with ❤️ for sales teams who want to generate and manage leads efficiently**

*Last Updated: February 2026*

# HubSpot Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your HubSpot API Key (2 min)

**For Local Development (Private App - Recommended):**

1. Go to https://app.hubspot.com/l/settings/apps/private-apps
2. Click "Create private app"
3. Name it: "Lead Generation Integration"
4. Click "Show all scopes" then enable:
   - ✅ `crm.objects.contacts.read`
   - ✅ `crm.objects.contacts.write`
   - ✅ `crm.objects.deals.read`
   - ✅ `crm.objects.deals.write`
5. Click "Create app"
6. Copy the **Access Token**

### Step 2: Configure Environment (1 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   HUBSPOT_API_KEY=pat-na1-YOUR_TOKEN_HERE
   GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
   DEBUG=True
   ```

### Step 3: Install Dependencies (1 min)

```bash
pip install -r requirements.txt
```

### Step 4: Start the Application (1 min)

**Terminal 1 - Start Backend API:**
```bash
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Start Streamlit UI:**
```bash
streamlit run hubspot_app.py
```

### Step 5: Connect to HubSpot in UI (0.5 min)

1. Open: http://localhost:8501
2. Click "⚙️ Setup" in left sidebar
3. Paste your HubSpot Access Token
4. Click "✅ Connect to HubSpot"
5. See "✅ HubSpot Connected" message

## 💡 Key Features to Try

### Feature 1: Search & Sync Businesses
```
Query: "coffee shops in Seattle"
↓
Results appear in table
↓
Click "📤 Sync All to HubSpot"
↓
Leads now in HubSpot CRM!
```

### Feature 2: Selective Sync
```
Click "📋 Select Leads"
↓
Choose specific businesses
↓
Click "📤 Sync Selected Leads"
```

### Feature 3: Manual Lead Creation
```
Tab: "📊 Lead Management"
↓
Fill in lead details
↓
Click "✅ Create Lead"
```

### Feature 4: Create Deals
```
Tab: "📊 Lead Management"
↓
Fill in deal details
↓
Click "✅ Create Deal"
```

## 🔌 API Endpoints Reference

### Check Connection
```bash
curl http://localhost:8000/api/v1/hubspot/status
```

### Create Single Lead
```bash
curl -X POST http://localhost:8000/api/v1/hubspot/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@business.com",
    "firstname": "John",
    "lastname": "Doe",
    "company": "ABC Corp"
  }'
```

### Batch Import Leads
```bash
curl -X POST http://localhost:8000/api/v1/hubspot/leads/batch \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {"email": "john@co.com", "firstname": "John"},
      {"email": "jane@co.com", "firstname": "Jane"}
    ]
  }'
```

### Create Deal
```bash
curl -X POST http://localhost:8000/api/v1/hubspot/deals \
  -H "Content-Type: application/json" \
  -d '{
    "dealname": "New Lead",
    "dealstage": "negotiation",
    "amount": "50000"
  }'
```

## 🆘 Troubleshooting

### Problem: "Invalid API Key"
- **Solution:** Copy & paste token again, verify no extra spaces

### Problem: "Connection failed: 401"
- **Solution:** Check token hasn't expired, regenerate in HubSpot

### Problem: "Email is required"
- **Solution:** All leads need email. System generates `businessname@business.local` for search results

### Problem: "Streamlit page blank"
- **Solution:** Check backend is running (`http://localhost:8000/health`)

### Problem: "Can't connect to localhost:8000"
- **Solution:** 
  ```bash
  # In Terminal 1
  python -m uvicorn app.main:app --reload --port 8000
  ```

## 📊 Project Structure

```
LeadGeneration/
├── app/
│   ├── main.py                    # FastAPI app
│   ├── config.py                  # Settings (includes HubSpot config)
│   ├── services/
│   │   ├── hubspot_service.py    # 🆕 HubSpot API client
│   │   └── google_maps_service.py
│   ├── models/
│   │   ├── hubspot.py            # 🆕 HubSpot models
│   │   └── business.py
│   ├── schemas/
│   │   ├── hubspot.py            # 🆕 HubSpot schemas
│   │   └── business.py
│   ├── routes/
│   │   ├── hubspot.py            # 🆕 HubSpot endpoints
│   │   └── businesses.py
│   └── utils/
│       └── hubspot_helper.py     # 🆕 Streamlit helpers
├── hubspot_app.py                 # 🆕 Main Streamlit app
├── streamlit_app.py               # Original app
├── HUBSPOT_INTEGRATION.md          # 🆕 Full documentation
├── .env.example                    # 🆕 Configuration template
├── requirements.txt                # Updated with new deps
└── tests/
    └── test_hubspot.py            # 🆕 Unit tests
```

## 🔑 Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `HUBSPOT_API_KEY` | ✅ | `pat-na1-xxx` | Private app token |
| `GOOGLE_MAPS_API_KEY` | ✅ | `AIzaSy...` | Google Maps API |
| `DEBUG` | ❌ | `True` | Debug mode |
| `HUBSPOT_REDIRECT_URI` | ❌ | `http://localhost:8000/callback` | For OAuth |

## 📚 Next Steps

1. **Read Full Docs:** `HUBSPOT_INTEGRATION.md`
2. **Explore API:** Open http://localhost:8000/docs (Swagger UI)
3. **Run Tests:** `pytest tests/test_hubspot.py -v`
4. **Deploy:** See deployment section in full docs

## 🎯 Common Workflows

### Workflow: Daily Lead Import
```
1. Search "target businesses in [city]"
2. Review results
3. Click "Sync All" → Import to HubSpot
4. Go to HubSpot → create deals → follow up
```

### Workflow: Bulk Import from CSV
```
1. Convert CSV to API format
2. POST to /api/v1/hubspot/leads/batch
3. All contacts appear in HubSpot
```

### Workflow: Real-time Lead Qualification
```
1. Search businesses
2. Selective sync (pick best ones)
3. Immediately create deals
4. Assign to sales team
```

## 💬 Getting Help

- **HubSpot Docs:** https://developers.hubspot.com/docs
- **API Explorer:** http://localhost:8000/docs
- **Streamlit Docs:** https://docs.streamlit.io
- **FastAPI Docs:** https://fastapi.tiangolo.com

## 🎉 You're All Set!

Your lead generation app is now connected to HubSpot CRM. Start searching, syncing, and managing leads!

**Questions?** Check `HUBSPOT_INTEGRATION.md` for detailed documentation.

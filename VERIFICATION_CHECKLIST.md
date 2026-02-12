# Setup Verification Checklist

Use this checklist to verify your HubSpot integration is properly set up.

## ✅ Installation & Setup

- [ ] Python 3.9+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] `.env` file created from `.env.example`
- [ ] `HUBSPOT_API_KEY` added to `.env`
- [ ] `GOOGLE_MAPS_API_KEY` added to `.env`

## ✅ Backend Setup

- [ ] Backend starts: `python -m uvicorn app.main:app --reload`
- [ ] Health check works: `curl http://localhost:8000/health`
- [ ] Swagger docs available: `http://localhost:8000/docs`
- [ ] No errors in console

## ✅ File Structure

Run this to verify all files are created:

```bash
# Check HubSpot service
ls -la app/services/hubspot_service.py

# Check HubSpot models
ls -la app/models/hubspot.py

# Check HubSpot schemas
ls -la app/schemas/hubspot.py

# Check HubSpot routes
ls -la app/routes/hubspot.py

# Check Streamlit app
ls -la hubspot_app.py

# Check utils
ls -la app/utils/hubspot_helper.py

# Check tests
ls -la tests/test_hubspot.py

# Check documentation
ls -la QUICKSTART_HUBSPOT.md
ls -la HUBSPOT_INTEGRATION.md
ls -la MARKETPLACE_SUBMISSION.md
ls -la ARCHITECTURE.md
ls -la IMPLEMENTATION_SUMMARY.md
ls -la .env.example
```

## ✅ API Endpoints

Test these endpoints:

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. HubSpot connection status (should fail without token)
curl http://localhost:8000/api/v1/hubspot/status

# 3. API documentation
curl http://localhost:8000/docs
```

## ✅ Streamlit App

- [ ] Streamlit starts: `streamlit run hubspot_app.py`
- [ ] App loads without errors
- [ ] Sidebar shows configuration options
- [ ] Can paste HubSpot token
- [ ] Can click "Check Status" (should show connected/not connected)
- [ ] Three tabs visible: Search & Sync, Lead Management, HubSpot Contacts

## ✅ Configuration

Check your `.env` file has:

```bash
# .env file should contain:
HUBSPOT_API_KEY=pat-na1-yourtoken
GOOGLE_MAPS_API_KEY=yourgooglekey
DEBUG=True
```

Verify loading:

```python
# In Python:
from app.config import settings
print(settings.HUBSPOT_API_KEY)  # Should not print dummy value
print(settings.GOOGLE_MAPS_API_KEY)  # Should show your key
```

## ✅ HubSpot Connection

1. **Get Access Token:**
   - Visit: https://app.hubspot.com/l/settings/apps/private-apps
   - Click "Create private app"
   - Enable scopes: contacts.read, contacts.write, deals.read, deals.write
   - Copy token

2. **Test via API:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/hubspot/connection \
     -H "Content-Type: application/json" \
     -d '{"access_token":"your_token"}'
   
   # Response should be:
   {"connected": true, "message": "Successfully connected..."}
   ```

3. **Test via Streamlit:**
   - Open http://localhost:8501
   - Click "⚙️ Setup"
   - Paste your token
   - Click "✅ Connect to HubSpot"
   - Should show "✅ HubSpot Connected"

## ✅ Google Maps API

- [ ] API key obtained from Google Cloud Console
- [ ] Places API enabled in Google Cloud Console
- [ ] Token added to `.env`
- [ ] Can search businesses: `curl http://localhost:8000/api/v1/businesses/search?query=coffee`

## ✅ Unit Tests

Run tests:

```bash
# Run specific test file
pytest tests/test_hubspot.py -v

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app

# Expected: All tests pass
```

Check these pass:
- [ ] `test_verify_connection_success`
- [ ] `test_verify_connection_failure`
- [ ] `test_create_lead_success`
- [ ] `test_create_batch_leads`
- [ ] `test_hubspot_lead_to_dict`
- [ ] `test_hubspot_deal_to_dict`

## ✅ Core Features

### Search & Sync
- [ ] Can search businesses
- [ ] Results display in table
- [ ] Can click "Sync All to HubSpot"
- [ ] Leads appear in HubSpot CRM

### Lead Management
- [ ] Can create single lead
- [ ] Can create deal
- [ ] Proper error messages on invalid input

### Contact Search
- [ ] Can search HubSpot contacts
- [ ] Results display correctly

### Connection Management
- [ ] Can set new API token
- [ ] Connection status updates
- [ ] Can check status anytime

## ✅ Documentation

Verify all docs are present:

- [ ] `QUICKSTART_HUBSPOT.md` - 5-minute setup
- [ ] `HUBSPOT_INTEGRATION.md` - Complete reference
- [ ] `MARKETPLACE_SUBMISSION.md` - Publishing guide
- [ ] `ARCHITECTURE.md` - System design
- [ ] `IMPLEMENTATION_SUMMARY.md` - What was built
- [ ] `.env.example` - Configuration template
- [ ] `README.md` - Original project readme (if exists)

## ✅ Error Handling

These should all return proper error messages:

```bash
# 1. Invalid JSON
curl -X POST http://localhost:8000/api/v1/hubspot/leads \
  -H "Content-Type: application/json" \
  -d 'invalid json'
# Should return: 422 Unprocessable Entity

# 2. Missing required field
curl -X POST http://localhost:8000/api/v1/hubspot/leads \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John"}'
# Should return: 422 with "email is required"

# 3. Invalid API key
curl http://localhost:8000/api/v1/hubspot/status \
  -H "Authorization: Bearer invalid-token"
# Should return: 401 or connection error
```

## ✅ Performance

- [ ] Batch import 100 leads completes in < 10 seconds
- [ ] Single lead creation completes in < 2 seconds
- [ ] Search completes in < 5 seconds

## ✅ Security

Check these security practices are in place:

- [ ] No secrets in code (all in `.env`)
- [ ] `.env` file in `.gitignore`
- [ ] No API keys in logs
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info

Verify `.gitignore` contains:

```
.env
__pycache__/
*.pyc
.pytest_cache/
.DS_Store
```

## ✅ Configuration Files

Verify these files exist and are correct:

```
✓ app/config.py - Has HubSpot settings
✓ app/main.py - Includes hubspot routes
✓ requirements.txt - Has email-validator
✓ .env.example - Template provided
✓ .env - Your actual secrets (not in repo)
```

## 🚀 Quick Test Sequence

Run these in order to verify everything works:

### Terminal 1: Start Backend
```bash
python -m uvicorn app.main:app --reload --port 8000
# Wait for: "Uvicorn running on http://127.0.0.1:8000"
```

### Terminal 2: Test API
```bash
# Test health
curl http://localhost:8000/health
# Expected: {"status":"healthy",...}

# Test HubSpot status (before connection)
curl http://localhost:8000/api/v1/hubspot/status
# Expected: {"connected":false,...}
```

### Terminal 3: Start Streamlit
```bash
streamlit run hubspot_app.py
# Wait for: "You can now view your Streamlit app..."
# Open: http://localhost:8501
```

### In Browser:
1. Open http://localhost:8501
2. Click "⚙️ Setup" in sidebar
3. Enter your HubSpot token (from https://app.hubspot.com/l/settings/apps/private-apps)
4. Click "✅ Connect to HubSpot"
5. Should show "✅ HubSpot Connected"

### Terminal 2: Verify Connection
```bash
curl http://localhost:8000/api/v1/hubspot/status
# Expected: {"connected":true,...}
```

### Try a Search:
1. In Streamlit, enter search query (e.g., "coffee shops")
2. Click "🔎 Search"
3. See results in table
4. Click "📤 Sync All to HubSpot"
5. Should show success message
6. Check HubSpot - contacts should appear!

## ✅ Troubleshooting

If something doesn't work:

| Issue | Solution |
|-------|----------|
| "Cannot import app" | Check Python path, virtual env activated |
| "HUBSPOT_API_KEY not set" | Check `.env` file exists and has the key |
| "Connection refused" | Backend not running on port 8000 |
| "Invalid API key" | Verify token from HubSpot, check for spaces/typos |
| "Streamlit blank page" | Check backend is running, check browser console |
| "Email is required" | All leads need email field |
| "ModuleNotFoundError" | Run `pip install -r requirements.txt` |

## ✅ Deployment Readiness

Before deploying to production:

- [ ] All tests pass: `pytest tests/ -v`
- [ ] No console errors when running
- [ ] Documentation complete and accurate
- [ ] `.env` file never committed to git
- [ ] `.env.example` shows all required variables
- [ ] Health check endpoint working
- [ ] Error handling tested
- [ ] Rate limiting configured (if needed)
- [ ] Logging configured
- [ ] HTTPS enabled

## 📊 Verification Report Template

```
Project: Lead Generation with HubSpot Integration
Date: _______________
Status: [  ] Ready [  ] In Progress [  ] Needs Work

Components Verified:
✓ Backend API - Working
✓ Streamlit UI - Working
✓ HubSpot Connection - Working
✓ Lead Sync - Working
✓ Deal Creation - Working
✓ Error Handling - Working
✓ Unit Tests - Passing
✓ Documentation - Complete

Issues Found:
(List any issues)

Next Steps:
(List what to do next)

Sign Off:
Developer: _________________ Date: _____________
```

## 📞 Getting Help

If you get stuck:

1. **Quick Setup:** Check `QUICKSTART_HUBSPOT.md`
2. **Detailed Docs:** Check `HUBSPOT_INTEGRATION.md`
3. **API Docs:** Visit `http://localhost:8000/docs`
4. **Architecture:** Check `ARCHITECTURE.md`
5. **HubSpot Docs:** Visit `https://developers.hubspot.com`

---

✅ **All checks passed?** You're ready to use your HubSpot integration!

❓ **Still having issues?** Review the documentation or check the troubleshooting section in `HUBSPOT_INTEGRATION.md`.

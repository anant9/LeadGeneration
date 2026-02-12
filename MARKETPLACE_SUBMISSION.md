# HubSpot Marketplace Listing Guide

## 📦 Publishing to HubSpot Marketplace

This guide explains how to publish your Lead Generation app as a HubSpot marketplace integration.

## Prerequisites

- ✅ HubSpot Developer Account
- ✅ Functional private or OAuth app
- ✅ App deployed and publicly accessible
- ✅ Documentation complete
- ✅ Support contact established

## Step 1: Prepare Your App for Marketplace

### 1.1 Marketplace Requirements

Your app must:

- ✅ Use OAuth or Private App authentication
- ✅ Handle all HubSpot API errors gracefully
- ✅ Implement rate limit handling
- ✅ Support multiple HubSpot portals
- ✅ Have clear error messages
- ✅ Log all important events
- ✅ Be secure (HTTPS, no hardcoded secrets)
- ✅ Have comprehensive documentation
- ✅ Include support contact information

### 1.2 Security Checklist

```
✅ No hardcoded API keys
✅ Environment variables for secrets
✅ Input validation (Pydantic schemas)
✅ HTTPS-only in production
✅ Rate limit handling
✅ Error logging (sensitive data masked)
✅ Token refresh implementation
✅ Scope validation
✅ Data encryption at rest
✅ GDPR compliance (if applicable)
```

### 1.3 Code Quality

```bash
# Run linting
flake8 app/

# Run tests
pytest tests/ -v --cov=app

# Type checking
mypy app/
```

## Step 2: Prepare Marketplace Materials

### 2.1 App Logo (Required)

- **Format:** PNG, JPG, SVG
- **Size:** 300x300px
- **Aspect Ratio:** 1:1 square
- **Content:** Clear, professional logo
- **Guidelines:** No text overlay, simple design

### 2.2 Screenshot (Required)

- **Format:** PNG, JPG
- **Size:** 1280x720px (recommended)
- **Content:** Show main features
- **Guidelines:** 
  - Include UI elements
  - Show data being synced
  - Highlight key features
  - Professional appearance

### 2.3 App Description (Required)

**Short Description (max 60 characters):**
```
Lead Generation & HubSpot Lead Sync Integration
```

**Full Description (max 5000 characters):**
```
Automatically sync leads from Google Maps search results 
directly into your HubSpot CRM. 

Features:
✓ Search nearby businesses by location and type
✓ One-click sync to HubSpot contacts
✓ Batch import multiple leads at once
✓ Create deals and manage opportunities
✓ Real-time lead tracking and management
✓ Flexible upsert functionality
✓ Full deal pipeline support

Perfect for:
- Sales teams conducting lead research
- Marketing teams qualifying prospects
- Real estate professionals
- Local service businesses
- B2B sales operations

Get started in minutes with our OAuth or Private App 
authentication options. Full documentation and support 
included.
```

### 2.4 Support Information

**Support Email:** `support@yourdomain.com`

**Support Portal:** `https://yourdomain.com/support`

**Documentation:** `https://github.com/yourrepo/HUBSPOT_INTEGRATION.md`

**Response Time:** Indicate SLA (e.g., "24 hours")

## Step 3: HubSpot Marketplace Portal Setup

### 3.1 Create Marketplace Account

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com)
2. Navigate to "Marketplace" → "My apps"
3. Click "Create app" or "List existing app"
4. Fill in app details

### 3.2 App Configuration

```yaml
App Name: Lead Generation & HubSpot Sync
Category: Sales Tools
Subcategory: Lead Management
Type: Integration
Scopes Required:
  - crm.objects.contacts.read
  - crm.objects.contacts.write
  - crm.objects.deals.read
  - crm.objects.deals.write
OAuth Redirect URI: https://yourdomain.com/api/v1/hubspot/callback
```

### 3.3 Pricing

Options:
- **Free** - Basic lead sync (up to 100/month)
- **Freemium** - Free tier + paid upgrades
- **Paid Tier 1** - $29/month (unlimited leads)
- **Paid Tier 2** - $99/month (premium features)
- **Enterprise** - Custom pricing

## Step 4: Deployment Checklist

Before submitting to marketplace:

### Backend Deployment

- [ ] Deploy to production server (AWS, Azure, Heroku)
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure domain name
- [ ] Set up monitoring and alerting
- [ ] Enable logging
- [ ] Configure database (if needed)
- [ ] Set up backups
- [ ] Test all API endpoints
- [ ] Document installation requirements
- [ ] Create health check endpoint

### Example Deployment (Heroku)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set HUBSPOT_API_KEY=your_key
heroku config:set GOOGLE_MAPS_API_KEY=your_key

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Example with Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY app app
COPY run.py run.py

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t lead-gen-hubspot .
docker run -p 8000:8000 -e HUBSPOT_API_KEY=your_key lead-gen-hubspot
```

### Streamlit Deployment

**Deploy to Streamlit Cloud:**
1. Push code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect GitHub repo
4. Configure main file: `hubspot_app.py`
5. Add secrets (HubSpot key)
6. Deploy

## Step 5: Testing Checklist

### Functional Testing

- [ ] Test OAuth flow end-to-end
- [ ] Test lead creation with various data
- [ ] Test batch lead import
- [ ] Test deal creation
- [ ] Test error handling (invalid token, network error)
- [ ] Test rate limiting
- [ ] Test concurrent requests
- [ ] Test data validation
- [ ] Test field mapping accuracy

### Security Testing

- [ ] No hardcoded secrets exposed
- [ ] API tokens not logged
- [ ] Input validation working
- [ ] SQL injection prevention (if DB used)
- [ ] XSS prevention in UI
- [ ] CORS properly configured
- [ ] Rate limiting functional
- [ ] Token expiration handling

### Performance Testing

- [ ] Response time < 2 seconds
- [ ] Batch import performance (100+ leads)
- [ ] Memory usage acceptable
- [ ] Database queries optimized
- [ ] Caching implemented

### Test Command

```bash
# Run all tests
pytest tests/ -v --cov=app

# Example output required
tests/test_hubspot.py::test_verify_connection PASSED
tests/test_hubspot.py::test_create_lead PASSED
tests/test_hubspot.py::test_batch_leads PASSED
tests/test_services.py::test_google_maps PASSED
```

## Step 6: Submit to Marketplace

### 6.1 Submission Form

1. **App Details**
   - Name, description, category
   - Logo, screenshots
   - Version number (e.g., v1.0.0)

2. **Technical Info**
   - OAuth redirect URI
   - API endpoint
   - Supported HubSpot editions
   - Webhook support (if applicable)

3. **Listing Info**
   - Support email
   - Documentation URL
   - Privacy policy
   - Terms of service
   - Pricing information

4. **Approval**
   - Terms acceptance
   - Privacy compliance
   - Data handling statement

### 6.2 Submission URL

Visit: https://app.hubspot.com/marketplace/apps/submit

## Step 7: Marketplace Guidelines

### Best Practices

1. **Documentation**
   - Clear setup instructions
   - API reference with examples
   - Troubleshooting guide
   - Video tutorial (optional but recommended)

2. **UI/UX**
   - Intuitive connection flow
   - Clear error messages
   - Progress indicators
   - Help tooltips

3. **Support**
   - Responsive support team
   - Public issue tracker
   - Regular updates
   - Community forum (optional)

4. **Compliance**
   - Data privacy statement
   - Security practices
   - Compliance certifications (SOC 2, etc.)
   - Regular security audits

### Example Support Template

```
Support Email: support@yourdomain.com
Response Time: Within 24 business hours
Hours: Monday-Friday 9AM-5PM EST
Availability: Email, Support portal, Live chat

For urgent issues:
- Email with "URGENT" in subject
- Or call emergency hotline: +1-XXX-XXX-XXXX
```

## Step 8: Post-Launch

### Ongoing Maintenance

- Update for HubSpot API changes
- Security patches within 24 hours
- Bug fixes weekly
- Feature releases monthly
- Monitor marketplace reviews
- Respond to user feedback
- Keep documentation updated
- Track analytics and usage

### Version Management

```
v1.0.0 - Initial launch
  - Basic lead sync
  - OAuth support
  - Batch import

v1.1.0 - Features
  - Deal management
  - Advanced filtering
  - Custom mappings

v2.0.0 - Major
  - Webhook support
  - Real-time sync
  - Advanced analytics
```

## Troubleshooting Marketplace Issues

### Common Rejection Reasons

| Reason | Solution |
|--------|----------|
| Missing documentation | Add HUBSPOT_INTEGRATION.md link |
| Unclear use case | Improve description with use cases |
| No support contact | Add email and support portal |
| Security concerns | Add security info, remove secrets, audit code |
| API error handling | Implement comprehensive error handling |
| Rate limiting | Add rate limit handling |
| Data privacy | Add privacy policy, GDPR compliance |

## Example Marketplace Listing

### Title
**Lead Generation & HubSpot Lead Sync**

### Subtitle
Search businesses and sync leads to HubSpot CRM in seconds

### Category
Sales Tools > Lead Management

### Description
[Full description from Step 2.3]

### Key Features
- 🔍 Smart business search with Google Maps integration
- 📤 One-click lead sync to HubSpot contacts
- 📊 Batch import multiple leads at once
- 🤝 Automatic deal creation
- 🔄 Create or update existing leads
- 📈 Full data tracking with location info
- 🔌 Seamless OAuth integration

### Requirements
- Active HubSpot account
- Google Maps API key (optional)
- Internet connection

### Pricing
FREE - $0/month (includes up to 100 leads)
PROFESSIONAL - $29/month (unlimited leads)

### Support
Email: support@yourdomain.com
Docs: https://yourdomain.com/docs/hubspot

---

## Resources

- [HubSpot Marketplace Guidelines](https://developers.hubspot.com/marketplace)
- [HubSpot API Documentation](https://developers.hubspot.com/docs)
- [Marketplace Best Practices](https://developers.hubspot.com/docs/partner-program)

---

**Ready to launch?** Follow this checklist and submit to the HubSpot marketplace!

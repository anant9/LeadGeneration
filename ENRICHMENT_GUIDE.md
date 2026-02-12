# Contact Enrichment Feature Guide

## 🎯 Overview

The **Contact Enrichment** feature automatically extracts contact information from business websites using:
- **Web Scraping**: Intelligently scrapes contact/about pages
- **LLM Intelligence**: Uses Google Gemini API to identify and extract contact information
- **Modular Architecture**: Completely separate from existing functionality

## ✨ Features

✅ Automatic website scraping  
✅ Intelligent contact extraction (names, emails, titles, departments)  
✅ Confidence scoring for each extraction  
✅ Per-record enrichment (no batch processing required)  
✅ Beautiful UI display of extracted contacts  
✅ Direct email/phone links from extracted contacts  

## 🚀 Setup Instructions

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create new API key"
3. Copy the key

**Free Tier Available!** 
- 60 requests/minute free
- No credit card required initially
- Perfect for testing and development

### Step 2: Add to Environment

Edit `.env` file and add:
```env
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

New packages installed:
- `beautifulsoup4==4.12.2` - Web scraping
- `lxml==4.9.3` - HTML parsing
- `google-generativeai==0.3.0` - Gemini API integration

### Step 4: Restart Services

```bash
# Kill old processes
# Then run:
python run.py
```

## 📖 How to Use

### 1. Search for Businesses
- Go to http://localhost:3000
- Search for businesses (e.g., "coffee shops in NYC")
- Get up to 5 results

### 2. Enrich Individual Records
- Click **🔍 Find Contacts** button on any result with a website
- The system will:
  1. Scrape the website
  2. Extract contacts using AI
  3. Display results in a beautiful card

### 3. View Extracted Contacts
Each contact shows:
- **Name** - Person's full name
- **Title** - Job title (if available)
- **Department** - Team/department (if available)
- **Email** - Clickable email link
- **Phone** - Clickable phone link
- **Confidence Score** - AI confidence level (0-100%)

### 4. Use Extracted Contacts
- Click email to draft message
- Click phone to call
- Manually add to CRM
- Use in business outreach

## 🏗️ Architecture

```
Frontend (Next.js)
    ├── components/ContactsList.tsx
    └── pages/index.tsx (+ Enrich button)
            ↓
Frontend API Client (lib/api.ts)
    └── enrichBusiness(name, website)
            ↓
Backend FastAPI (Port 8000)
    ├── routes/enrichment.py
    ├── services/web_scraper_service.py
    └── services/contact_extractor_service.py
            ↓
External Services
    ├── Website (HTTP requests)
    └── Google Gemini API (LLM)
```

## 📊 API Endpoints

### Single Business Enrichment
```bash
POST /api/v1/enrichment/enrich
Content-Type: application/json

{
  "name": "Acme Corp",
  "website": "https://example.com",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "name": "Acme Corp",
  "website": "https://example.com",
  "contacts": [
    {
      "name": "John Smith",
      "title": "CEO",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "department": "Leadership"
    }
  ],
  "confidence": 0.89,
  "scraped_content_length": 4250,
  "status": "success"
}
```

### Batch Enrichment
```bash
POST /api/v1/enrichment/batch-enrich
Content-Type: application/json

{
  "businesses": [
    {
      "name": "Company A",
      "website": "https://companyA.com"
    },
    {
      "name": "Company B",
      "website": "https://companyB.com"
    }
  ]
}
```

### Health Check
```bash
GET /api/v1/enrichment/health
```

## 💡 Tips & Best Practices

### ✅ Works Best
- Corporate websites with clear contact pages
- Large organizations with team listings
- Websites with "About Us" or "Contact Us" pages
- Businesses with leadership bios

### ⚠️ May Have Lower Confidence
- Small business websites with minimal content
- Websites with JavaScript-heavy content
- Websites requiring authentication
- Heavily obfuscated contact information

### 🔄 Retry Strategy
If enrichment fails:
1. Check if website is accessible
2. Try a different search term
3. Verify Gemini API key is valid
4. Check rate limits (free tier: 60 req/min)

## 🔌 Integration with CRM

Once you have extracted contacts, you can:

### Option 1: Manual Entry
1. Copy contact info from extraction
2. Go to "Lead Management" tab
3. Create lead manually with contact details

### Option 2: Future Batch Import
(Coming soon)
1. Export extracted contacts
2. Bulk import to CRM
3. Auto-map fields

## 📈 Costs

- **Google Maps API**: ~$7/1000 searches
- **OpenAI API**: ~$0.001-$0.003 per enrichment
  - Typical enrichment: ~50-100 tokens
  - Estimated cost: $0.015-$0.05 per business
  
**Example:** Enriching 100 businesses ≈ $1.50-$5.00

## � Security & Privacy

- Website content is fetched securely (HTTPS)
- Content sent to Google Gemini per their privacy policy
- No data is stored locally (use it and discard)
- Rate limiting prevents abuse

## 💰 Costs

**Google Gemini:**
- **Free Tier**: 60 requests/minute (perfect for dev)
- **Paid**: ~$0.00025 per request (very cheap!)
- No credit card required for free tier
- Paid tier: $5 minimum monthly spend

Compared to other LLMs:
- OpenAI GPT-3.5: ~$0.001-$0.003 per request
- Claude: ~$0.005-$0.015 per request
- **Gemini: $0.00025 per request** (cheapest option!)

**Total Cost Example:** 
- Enriching 1,000 businesses ≈ $0.25 (Gemini) vs $1-5 (others)

### "No contacts found on website"
- This means the website doesn't have clear contact info
- Try searching for the company's sales/contact pages manually
- Some websites don't publish contact info publicly

### "Enrichment failed"
- Check internet connection
- Verify Gemini API key is valid
- Check you haven't exceeded free tier rate limit (60 req/min)
- Wait a moment and try again

### Slow enrichment
- First request takes ~2-4 seconds (normal)
- Gemini API response time varies by server load
- Try during off-peak hours for faster responses
- Free tier is rate-limited to 60 req/min

### Rate limit exceeded
- Free tier: 60 requests/minute max
- Wait a minute and try again
- Upgrade to paid tier for higher limits
- Check http://localhost:8000/docs for health status

## 🔐 Security & Privacy

- Website content is fetched securely (HTTPS)
- Content sent to OpenAI per their privacy policy
- No data is stored locally (use it and discard)
- Rate limiting prevents abuse

## 📝 Modular Design

The enrichment system is completely modular:
- `WebScraperService` - Can be used standalone
- `ContactExtractorService` - Can use different LLMs
- Separate routes - Can be disabled without affecting search
- Independent from CRM integrations

To use programmatically:

```python
from app.services.web_scraper_service import WebScraperService
from app.services.contact_extractor_service import ContactExtractorService

scraper = WebScraperService()
content = scraper.scrape_contact_pages("https://example.com")

extractor = ContactExtractorService(api_key="gemini_api_key_here")
result = extractor.extract_contacts("Example Inc", "https://example.com", content)

print(result.contacts)  # List of Contact objects
print(result.confidence)  # 0-1 confidence score
```

## 🚀 Next Steps

1. Get Google Gemini API key and add to `.env`
2. Install dependencies: `pip install -r requirements.txt`
3. Restart services: `python run.py`
4. Try enriching a business with visible website (free tier: 60 req/min)
5. Give feedback for improvements!

---

**Questions?** Check the backend logs at http://localhost:8000/docs for the enrichment endpoints

"""
Contact Extractor Service - Uses Crawl4AI to extract structured contact data
"""

import asyncio
import json
import logging
import re
from typing import Optional, List, Dict, Any, Tuple
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class Contact(BaseModel):
    """Contact information extracted from website"""
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    department: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    other_social_urls: Optional[List[str]] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None


class ContactExtractionResult(BaseModel):
    """Result of contact extraction"""
    business_name: str
    website: str
    contacts: List[Contact]
    confidence: float  # 0-1 confidence score


class ContactExtractorService:
    """Service for extracting contacts using Crawl4AI and optional LLM enrichment"""

    def __init__(self, max_pages: int = 6, gemini_api_key: Optional[str] = None, gemini_model: Optional[str] = None):
        """
        Initialize Crawl4AI settings

        Args:
            max_pages: Maximum number of pages to crawl per business
            gemini_api_key: Optional Gemini API key for LLM enrichment
            gemini_model: Optional Gemini model name
        """
        self.max_pages = max_pages
        self.gemini_api_key = gemini_api_key
        self.gemini_model = gemini_model
        self._llm_enabled = bool(gemini_api_key)
        self.contact_paths = [
            "/contact",
            "/contact-us",
            "/about",
            "/team",
            "/about-us",
            "/our-team",
            "/staff",
            "/people",
        ]

    def extract_contacts(
        self,
        business_name: str,
        website_url: str,
        address: Optional[str] = None,
    ) -> ContactExtractionResult:
        """
        Extract contacts from the website using Crawl4AI output
        """
        urls = self._build_url_list(website_url)

        try:
            text, links = asyncio.run(self._crawl_urls(urls))
            contacts, confidence = self._derive_contacts(
                text=text,
                links=links,
                business_name=business_name,
                website_url=website_url,
                address=address,
            )
            return ContactExtractionResult(
                business_name=business_name,
                website=website_url,
                contacts=contacts,
                confidence=confidence,
            )
        except RuntimeError:
            # If running within an existing event loop (e.g. async server), use a new loop
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                text, links = loop.run_until_complete(self._crawl_urls(urls))
                contacts, confidence = self._derive_contacts(
                    text=text,
                    links=links,
                    business_name=business_name,
                    website_url=website_url,
                    address=address,
                )
                loop.close()
                return ContactExtractionResult(
                    business_name=business_name,
                    website=website_url,
                    contacts=contacts,
                    confidence=confidence,
                )
            except Exception as exc:
                logger.warning(f"Crawl4AI extraction error: {exc}")
                return ContactExtractionResult(
                    business_name=business_name,
                    website=website_url,
                    contacts=[],
                    confidence=0.0,
                )
        except Exception as exc:
            logger.warning(f"Crawl4AI extraction error: {exc}")
            return ContactExtractionResult(
                business_name=business_name,
                website=website_url,
                contacts=[],
                confidence=0.0,
            )

    def _build_url_list(self, website_url: str) -> List[str]:
        if not website_url:
            return []
        if not website_url.startswith(("http://", "https://")):
            website_url = "https://" + website_url
        urls = [website_url]
        for path in self.contact_paths:
            urls.append(website_url.rstrip("/") + path)
        # dedupe
        seen = set()
        out = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                out.append(u)
        return out

    async def _crawl_urls(self, urls: List[str]) -> Tuple[str, List[str]]:
        try:
            from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
        except ImportError as exc:
            raise ImportError("crawl4ai is not installed") from exc

        text_chunks: List[str] = []
        link_set = set()

        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            exclude_external_links=False,
            remove_overlay_elements=True,
        )

        async with AsyncWebCrawler() as crawler:
            for url in urls[: self.max_pages]:
                try:
                    result = await crawler.arun(url, config=config)
                    if getattr(result, "markdown", None):
                        text_chunks.append(result.markdown)
                    if getattr(result, "links", None):
                        for link in result.links:
                            link_set.add(link)
                except Exception as exc:
                    logger.debug(f"Crawl4AI failed for {url}: {exc}")

        return "\n".join(text_chunks), list(link_set)

    def _derive_contacts(
        self,
        text: str,
        links: List[str],
        business_name: str,
        website_url: str,
        address: Optional[str],
    ) -> Tuple[List[Contact], float]:
        if self._llm_enabled:
            llm_contacts, llm_confidence = self._extract_with_llm(
                text=text,
                links=links,
                business_name=business_name,
                website_url=website_url,
                address=address,
            )
            if llm_contacts:
                return llm_contacts, llm_confidence
        emails = re.findall(r"[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}", text or "")
        phones = re.findall(r"\+?\d[\d\-\s\(\)]{6,}\d", text or "")

        social = self._extract_social_links(links)

        contacts: List[Contact] = []
        email_list = self._dedupe_keep_order(emails)
        phone_list = self._dedupe_keep_order(phones)

        if email_list:
            for e in email_list[:5]:
                name = e.split("@")[0].replace(".", " ").replace("_", " ").title()
                contacts.append(
                    Contact(
                        name=name or "Unknown",
                        email=e,
                        phone=phone_list[0] if phone_list else None,
                        company=business_name,
                        website=website_url,
                        address=address,
                        linkedin_url=social.get("linkedin"),
                        twitter_url=social.get("twitter"),
                        facebook_url=social.get("facebook"),
                        instagram_url=social.get("instagram"),
                        youtube_url=social.get("youtube"),
                        other_social_urls=social.get("other"),
                        source_url=website_url,
                    )
                )
        elif phone_list or social:
            contacts.append(
                Contact(
                    name=f"{business_name} Contact",
                    phone=phone_list[0] if phone_list else None,
                    company=business_name,
                    website=website_url,
                    address=address,
                    linkedin_url=social.get("linkedin"),
                    twitter_url=social.get("twitter"),
                    facebook_url=social.get("facebook"),
                    instagram_url=social.get("instagram"),
                    youtube_url=social.get("youtube"),
                    other_social_urls=social.get("other"),
                    source_url=website_url,
                )
            )

        evidence = (1 if email_list else 0) + (1 if phone_list else 0) + (1 if social else 0)
        confidence = min(0.2 * evidence + 0.1, 0.7) if contacts else 0.0
        return contacts, confidence

    def _extract_with_llm(
        self,
        text: str,
        links: List[str],
        business_name: str,
        website_url: str,
        address: Optional[str],
    ) -> Tuple[List[Contact], float]:
        try:
            import google.generativeai as genai
        except Exception as exc:
            logger.warning(f"Gemini SDK not available: {exc}")
            return [], 0.0

        if not self.gemini_api_key:
            return [], 0.0

        try:
            genai.configure(api_key=self.gemini_api_key)
            model_name = self.gemini_model or "gemini-2.5-flash-lite"
            model = genai.GenerativeModel(model_name)
            prompt = self._build_llm_prompt(business_name, address, text, links)
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 1200,
                    "response_mime_type": "application/json",
                },
            )
            response_text = response.text.strip() if hasattr(response, "text") and response.text else ""
            contacts_data = self._parse_json_response(response_text)
            if not contacts_data:
                return [], 0.0

            contacts: List[Contact] = []
            for contact_dict in contacts_data.get("contacts", []):
                try:
                    if not contact_dict.get("name"):
                        email = contact_dict.get("email")
                        inferred = None
                        if email:
                            inferred = email.split("@")[0].replace(".", " ").replace("_", " ").title()
                        contact_dict["name"] = inferred or "Unknown"
                    if not contact_dict.get("source_url"):
                        contact_dict["source_url"] = website_url
                    contacts.append(Contact(**contact_dict))
                except Exception as exc:
                    logger.debug(f"Failed to parse contact from LLM: {exc}")
                    continue
            confidence = float(contacts_data.get("confidence", 0.6)) if contacts else 0.0
            return contacts, min(confidence, 1.0)
        except Exception as exc:
            logger.warning(f"LLM enrichment failed: {exc}")
            return [], 0.0

    def _build_llm_prompt(self, business_name: str, address: Optional[str], text: str, links: List[str]) -> str:
        address_text = f" Known address: {address}." if address else ""
        links_text = "\n".join(links[:50])
        return f"""
Extract all possible contact and lead enrichment data for the business below.

Business name: {business_name}.{address_text}
Website: {links[0] if links else ''}

Website content (truncated):
{(text or '')[:4000]}

Discovered links:
{links_text}

Return JSON only with this structure:
{{
  "contacts": [
    {{
      "name": "Full Name",
      "first_name": "First",
      "last_name": "Last",
      "title": "Job Title",
      "email": "email@example.com",
      "phone": "+1-234-567-8900",
      "mobile_phone": "+1-555-555-5555",
      "department": "Sales/Marketing/Leadership",
      "company": "Company Name",
      "website": "https://company.com",
      "industry": "Software/IT/Healthcare/etc",
      "address": "Street address",
      "city": "City",
      "state": "State",
      "postal_code": "12345",
      "country": "Country",
      "linkedin_url": "https://www.linkedin.com/in/...",
      "twitter_url": "https://twitter.com/...",
      "facebook_url": "https://facebook.com/...",
      "instagram_url": "https://instagram.com/...",
      "youtube_url": "https://youtube.com/...",
      "other_social_urls": ["https://..."],
      "source_url": "https://example.com/team",
      "notes": "Anything else relevant"
    }}
  ],
  "confidence": 0.85
}}

Rules:
- Only include contacts you can confidently identify from the text/links.
- If nothing is found, return empty contacts and confidence 0.
- Return ONLY valid JSON, no extra text.
"""

    def _parse_json_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        if not response_text:
            return None
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].lstrip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            try:
                start = cleaned.find("{")
                end = cleaned.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(cleaned[start:end])
            except json.JSONDecodeError:
                return None
        return None

    def _extract_social_links(self, links: List[str]) -> Dict[str, Optional[str]]:
        social = {
            "linkedin": None,
            "twitter": None,
            "facebook": None,
            "instagram": None,
            "youtube": None,
            "other": [],
        }
        for link in links or []:
            l = link.lower()
            if "linkedin.com" in l and not social["linkedin"]:
                social["linkedin"] = link
            elif ("twitter.com" in l or "x.com" in l) and not social["twitter"]:
                social["twitter"] = link
            elif "facebook.com" in l and not social["facebook"]:
                social["facebook"] = link
            elif "instagram.com" in l and not social["instagram"]:
                social["instagram"] = link
            elif "youtube.com" in l and not social["youtube"]:
                social["youtube"] = link
            else:
                if link not in social["other"]:
                    social["other"].append(link)
        if not social["other"]:
            social["other"] = None
        return social

    def _dedupe_keep_order(self, items: List[str]) -> List[str]:
        seen = set()
        out = []
        for i in items:
            if i not in seen:
                seen.add(i)
                out.append(i)
        return out

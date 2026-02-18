"""Natural language parsing for business search"""
from __future__ import annotations

import json
import logging
import re
from typing import Dict, Any, List
from urllib.parse import urlparse

from app.config import settings
from app.services.web_scraper_service import WebScraperService

logger = logging.getLogger(__name__)

_URL_REGEX = re.compile(
    r"^(https?://)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(/\S*)?$",
    re.IGNORECASE,
)

_NARROW_INTENT_PATTERNS = [
    re.compile(r"\b(companies|businesses|firms|manufacturers|distributors)\s+(needing|using|requiring|seeking)\b", re.IGNORECASE),
    re.compile(r"\b(who\s+need|that\s+need|looking\s+for)\b", re.IGNORECASE),
    re.compile(r"\b(needing|using|requiring|seeking)\b", re.IGNORECASE),
]

_DIRECTIONAL_REGION_PATTERN = re.compile(
    r"\b(north|south|east|west|northeast|northwest|southeast|southwest|midwest)\b",
    re.IGNORECASE,
)


def _normalize_language_code(value: Any) -> str:
    if value is None:
        return "en"

    language = str(value).strip().lower().replace("_", "-")
    if not language:
        return "en"

    if re.match(r"^[a-z]{2,3}(-[a-z0-9]{2,8})*$", language):
        return language.split("-")[0]

    return "en"


def _normalize_location_text(value: Any) -> str:
    location = str(value or "").strip()
    if not location:
        return "near me"

    compact = re.sub(r"\s+", " ", location).strip()
    lower = compact.lower()

    if _DIRECTIONAL_REGION_PATTERN.search(lower):
        if any(token in lower for token in ["us", "usa", "united states", "u.s."]):
            return "United States"
        if "india" in lower:
            return "India"
        if "uk" in lower or "united kingdom" in lower:
            return "United Kingdom"

    compact = re.sub(r"\b(the\s+)?(metroplex|region|area)\b", "", compact, flags=re.IGNORECASE)
    compact = re.sub(r"\s+", " ", compact).strip(" ,-")

    return compact or "near me"


def _extract_json(text: str) -> Dict[str, Any] | None:
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _extract_json_array(text: str) -> List[str] | None:
    if not text:
        return None
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass

    match = re.search(r"\[.*\]", text, re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        return None
    return None


def _build_prompt(query: str) -> str:
    return (
        "You extract business search intent from a natural language query. "
        "Return JSON only with this schema: {\"searchItem\": string, \"location\": string, \"language\": string}. "
        "The searchItem should be a business type or keyword (e.g., 'restaurant', 'law firm'). "
        "The location should be a city/state/country, or 'near me' if no explicit location is present. "
        "Avoid directional macro-regions like 'Southeast US', 'North India', or 'Midwest' in location. "
        "The language must be the detected language code of the user query in BCP-47 format "
        "(for example: 'en', 'hi', 'es', 'fr', 'de', 'en-us'). "
        "If multiple business types are present, choose the most specific one. "
        "Do not add any extra keys or commentary.\n\n"
        f"QUERY:\n{query}\n"
    )


def _build_website_prompt(website_url: str, website_text: str) -> str:
    return (
        "You are helping with lead generation. "
        "Based on the website content, suggest exactly 5 high-quality natural language search queries "
        "that the user can run to find potential customers for this business. "
        "These queries must be compatible with Google Maps text search. "
        "Keep each query broad and category-focused, not overly narrow or intent-heavy. "
        "Use formats like '<business category/service> in <city>' or '<category> near <city/area>'. "
        "Avoid phrases like 'companies needing', 'businesses using', 'who need', 'seeking', 'requiring'. "
        "Return JSON only with this schema: {\"language\": string, \"suggestedQueries\": string[]}. "
        "language must be a BCP-47 language code (for example: 'en', 'hi', 'es', 'fr', 'de'). "
        "suggestedQueries must contain exactly 5 unique, actionable queries and each query must include clear location intent. "
        "Good examples: 'electrical wholesalers in Delhi', 'industrial hardware suppliers near Mumbai'. "
        "Bad examples: 'companies needing brass cable glands Delhi', 'manufacturers seeking chlorine buyers'. "
        "Do not add commentary or extra keys.\n\n"
        f"WEBSITE_URL:\n{website_url}\n\n"
        f"WEBSITE_CONTENT:\n{website_text}\n"
    )


def _has_location_intent(query: str) -> bool:
    text = query.lower()
    return any(token in text for token in [" in ", " near ", " around ", " within ", " at ", " near me"])


def _normalize_maps_query(query: str) -> str:
    text = re.sub(r"\s+", " ", (query or "").strip())
    text = re.sub(r"[?.!]+$", "", text)

    for pattern in _NARROW_INTENT_PATTERNS:
        text = pattern.sub("", text)

    text = re.sub(
        r"\bin\s+the\s+(north|south|east|west|northeast|northwest|southeast|southwest|midwest)\s+(us|usa|united states)\b",
        "in United States",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(r"\s+", " ", text).strip(" ,-")

    if text.lower().startswith(("companies ", "businesses ", "firms ", "manufacturers ", "distributors ")):
        text = re.sub(r"^(companies|businesses|firms|manufacturers|distributors)\s+", "", text, flags=re.IGNORECASE)

    text = re.sub(r"\s+", " ", text).strip(" ,-")

    if text and not _has_location_intent(text):
        text = f"{text} near me"

    return text


def _is_google_maps_friendly_query(query: str) -> bool:
    text = (query or "").strip()
    if not text or len(text) > 90:
        return False
    if any(pattern.search(text) for pattern in _NARROW_INTENT_PATTERNS):
        return False
    if text.count(",") > 2:
        return False
    if not _has_location_intent(text):
        return False
    return True


def is_website_input(query: str) -> bool:
    text = (query or "").strip()
    if not text or " " in text:
        return False

    if text.startswith(("http://", "https://")):
        parsed = urlparse(text)
        return bool(parsed.netloc and "." in parsed.netloc)

    return bool(_URL_REGEX.match(text))


def _normalize_website_url(value: str) -> str:
    url = value.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    if not parsed.netloc:
        raise RuntimeError("Invalid website URL")

    return url


def parse_natural_language_query(query: str) -> Dict[str, str]:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("Search parsing is not configured")

    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.warning(f"LLM SDK not available: {exc}")
        raise RuntimeError("Search parsing is not available") from exc

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash-lite"
        model = genai.GenerativeModel(model_name)
        prompt = _build_prompt(query)
        response = model.generate_content(prompt)
        data = _extract_json(getattr(response, "text", ""))
        if not data or not isinstance(data, dict):
            raise RuntimeError("Search parsing returned invalid JSON")

        search_item = str(data.get("searchItem", "")).strip()
        location = _normalize_location_text(data.get("location"))
        language = _normalize_language_code(data.get("language"))
        if not search_item:
            raise RuntimeError("Search parsing did not identify a business type")

        return {
            "searchItem": search_item,
            "location": location,
            "language": language,
        }
    except Exception as exc:
        logger.warning(f"Search parsing failed: {exc}")
        raise RuntimeError("Search parsing failed") from exc


def suggest_customer_queries_from_website(website_input: str) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("Search parsing is not configured")

    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.warning(f"LLM SDK not available: {exc}")
        raise RuntimeError("Search parsing is not available") from exc

    website_url = _normalize_website_url(website_input)
    scraper = WebScraperService()
    website_text = scraper.scrape_contact_pages(website_url)
    if not website_text:
        raise RuntimeError("Could not read website content")

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash-lite"
        model = genai.GenerativeModel(model_name)

        prompt = _build_website_prompt(website_url, website_text)
        response = model.generate_content(prompt)
        response_text = getattr(response, "text", "")
        data = _extract_json(response_text)

        language = "en"
        suggestions: List[str] = []

        if isinstance(data, dict):
            language = _normalize_language_code(data.get("language"))
            raw_suggestions = data.get("suggestedQueries")
            if isinstance(raw_suggestions, list):
                suggestions = [str(item).strip() for item in raw_suggestions if str(item).strip()]

        if not suggestions:
            fallback = _extract_json_array(response_text)
            if fallback:
                suggestions = fallback

        suggestions = [_normalize_maps_query(item) for item in suggestions]
        suggestions = [item for item in suggestions if _is_google_maps_friendly_query(item)]

        seen = set()
        unique_suggestions: List[str] = []
        for item in suggestions:
            key = item.lower()
            if key in seen:
                continue
            seen.add(key)
            unique_suggestions.append(item)
            if len(unique_suggestions) == 5:
                break

        if len(unique_suggestions) < 5:
            raise RuntimeError("Could not generate 5 search suggestions")

        return {
            "websiteUrl": website_url,
            "language": language,
            "suggestedQueries": unique_suggestions,
        }
    except Exception as exc:
        logger.warning(f"Website suggestion generation failed: {exc}")
        raise RuntimeError("Website suggestion generation failed") from exc

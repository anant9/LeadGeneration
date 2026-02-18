"""Natural language parsing for business search"""
from __future__ import annotations

import json
import logging
import re
from typing import Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)


def _normalize_language_code(value: Any) -> str:
    if value is None:
        return "en"

    language = str(value).strip().lower().replace("_", "-")
    if not language:
        return "en"

    if re.match(r"^[a-z]{2,3}(-[a-z0-9]{2,8})*$", language):
        return language

    return "en"


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


def _build_prompt(query: str) -> str:
    return (
        "You extract business search intent from a natural language query. "
        "Return JSON only with this schema: {\"searchItem\": string, \"location\": string, \"language\": string}. "
        "The searchItem should be a business type or keyword (e.g., 'restaurant', 'law firm'). "
        "The location should be a city/area, or 'near me' if no explicit location is present. "
        "The language must be the detected language code of the user query in BCP-47 format "
        "(for example: 'en', 'hi', 'es', 'fr', 'de', 'en-us'). "
        "If multiple business types are present, choose the most specific one. "
        "Do not add any extra keys or commentary.\n\n"
        f"QUERY:\n{query}\n"
    )


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
        location = str(data.get("location", "")).strip() or "near me"
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

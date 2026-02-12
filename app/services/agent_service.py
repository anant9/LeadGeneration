"""Agent service for parsing chat into extraction parameters."""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from app.config import settings

logger = logging.getLogger(__name__)

PRICE_PER_RESULT = 0.01


def _estimate_cost(max_results: int) -> Tuple[int, str]:
    credits = max_results
    cost = credits * PRICE_PER_RESULT
    return credits, f"${cost:.2f}"


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
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


def _build_prompt(message: str, history: List[Dict[str, str]]) -> str:
    history_text = "\n".join(
        [f"{item.get('role','user').upper()}: {item.get('content','')}" for item in history]
    )
    return (
        "You are an AI assistant that converts chat requests into Google Maps extraction parameters. "
        "If critical info is missing (business type or location), ask one clarifying question and do not finalize a filter. "
        "If business type and location are already present, do not ask any clarifying question. "
        "Treat 'near me' as a valid location and set locationQuery to 'near me' (do not ask for a city). "
        "If the latest user message is a location-only reply (e.g., a place name) and earlier context includes the business type, combine them into a complete filter. "
        "If you already asked a clarification, use the user's next reply to fill the missing field instead of repeating the question. "
        "Otherwise, return a concise, friendly message plus a structured filter. "
        "Use maxResults only when user explicitly provides a number; otherwise default to 100. "
        "Always output JSON only.\n\n"
        "Return JSON with this schema:\n"
        "{\n"
        "  \"message\": string,\n"
        "  \"needsClarification\": boolean,\n"
        "  \"clarificationQuestion\": string | null,\n"
        "  \"needsConfirmation\": boolean,\n"
        "  \"queryText\": string,\n"
        "  \"filter\": {\n"
        "     \"searchQuery\": string,\n"
        "     \"locationQuery\": string,\n"
        "     \"maxResults\": number,\n"
        "     \"language\": \"en\",\n"
        "     \"region\": \"us\",\n"
        "     \"skipClosedPlaces\": true,\n"
        "     \"scrapeEmails\": true,\n"
        "     \"scrapeSocialMedia\": true,\n"
        "     \"scrapeReviewsDetail\": boolean,\n"
        "     \"maxReviews\": number\n"
        "  } | null\n"
        "}\n\n"
        f"CHAT HISTORY:\n{history_text}\n\n"
        f"LATEST USER MESSAGE:\n{message}\n"
    )


def chat_with_agent(message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("Gemini API key is not configured")

    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.warning(f"Gemini SDK not available: {exc}")
        raise RuntimeError("Gemini SDK not available") from exc

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash-lite"
        model = genai.GenerativeModel(model_name)
        prompt = _build_prompt(message, history)
        response = model.generate_content(prompt)
        data = _extract_json(getattr(response, "text", ""))
        if not data:
            raise RuntimeError("Gemini returned invalid JSON")

        filter_data = data.get("filter") if isinstance(data, dict) else None
        if filter_data:
            max_results = int(filter_data.get("maxResults") or 100)
            credits, cost_est = _estimate_cost(max_results)
            filter_data["estimatedCredits"] = credits
            filter_data["costEstimate"] = cost_est
            data["filter"] = filter_data

        return data
    except Exception as exc:
        logger.warning(f"Gemini chat parse failed: {exc}")
        raise RuntimeError("Gemini chat parse failed") from exc

"""Agent chat routes"""
import logging
from fastapi import APIRouter, HTTPException

from app.schemas.agent import AgentChatRequest, AgentChatResponse, ExtractionFilter
from app.services.agent_service import chat_with_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(request: AgentChatRequest):
    try:
        history = [item.model_dump() for item in request.history]
        data = chat_with_agent(request.message, history)
        if not isinstance(data, dict):
            raise HTTPException(status_code=500, detail="Invalid agent response")

        filter_payload = data.get("filter")
        filter_model = ExtractionFilter(**filter_payload) if filter_payload else None

        return AgentChatResponse(
            message=data.get("message", ""),
            filter=filter_model,
            queryText=data.get("queryText"),
            needsConfirmation=bool(data.get("needsConfirmation")),
            needsClarification=bool(data.get("needsClarification")),
            clarificationQuestion=data.get("clarificationQuestion"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Agent chat failed: {exc}")
        raise HTTPException(status_code=500, detail="Agent chat failed")

"""Agent chat schemas"""
from typing import List, Optional
from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message content")


class ExtractionFilter(BaseModel):
    searchQuery: str
    locationQuery: str
    maxResults: int
    language: str = "en"
    region: str = "us"
    skipClosedPlaces: bool = True
    scrapeEmails: bool = True
    scrapeSocialMedia: bool = True
    scrapeReviewsDetail: bool = False
    maxReviews: int = 0
    estimatedCredits: int
    costEstimate: str


class AgentChatRequest(BaseModel):
    message: str
    history: List[AgentMessage] = Field(default_factory=list)


class AgentChatResponse(BaseModel):
    message: str
    filter: Optional[ExtractionFilter] = None
    queryText: Optional[str] = None
    needsConfirmation: bool = False
    needsClarification: bool = False
    clarificationQuestion: Optional[str] = None

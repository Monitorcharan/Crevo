from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendedCreator(BaseModel):
    creator_id: str
    display_name: str
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    specialization: str
    availability: str
    starting_price: Optional[int] = None
    match_score: int = Field(..., ge=0, le=100, description="Explainable compatibility percentage")
    match_reasons: List[str] = Field(default_factory=list, description="Explicit deterministic reasons for match")
    ai_tools_matched: List[str] = Field(default_factory=list)
    skills_matched: List[str] = Field(default_factory=list)
    relevant_portfolio_sample: Optional[str] = None


class RecommendationResponse(BaseModel):
    brief_id: str
    recommendations: List[RecommendedCreator]
    total_matches: int
    algorithm_notice: str = "Explainable compatibility based on verified tool stack, category alignment, and portfolio formats."

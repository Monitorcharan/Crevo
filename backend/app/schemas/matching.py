from typing import List, Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    portfolio_score: float = Field(..., description="Semantic portfolio relevance score (0-100, weight 35%)")
    skills_score: float = Field(..., description="Skills and specialization alignment (0-100, weight 25%)")
    tools_score: float = Field(..., description="AI toolstack compatibility (0-100, weight 20%)")
    format_score: float = Field(..., description="Content format match (0-100, weight 15%)")
    availability_score: float = Field(..., description="Availability rating (0-100, weight 5%)")


class RelevantPortfolioItem(BaseModel):
    id: str
    title: str
    media_url: str
    media_type: str
    tools_used: List[str] = []
    relevance_score: float = Field(..., description="Semantic or heuristic relevance percentage (0-100)")
    commercial_use_status: str


class CreatorSummary(BaseModel):
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    specialization: str
    availability: str
    starting_price: Optional[int] = None
    price_unit: Optional[str] = "project"
    location: Optional[str] = None
    ai_tools: List[str] = []
    skills: List[str] = []


class CreatorMatch(BaseModel):
    creator_id: str
    creator: CreatorSummary
    match_score: float = Field(..., description="Overall normalized heuristic compatibility score (0-100)")
    score_breakdown: ScoreBreakdown
    matching_skills: List[str] = []
    matching_tools: List[str] = []
    relevant_portfolio_items: List[RelevantPortfolioItem] = []
    missing_requirements: List[str] = []
    explanation: str
    mandatory_checks_passed: bool = True


class MatchResponse(BaseModel):
    brief_id: str
    brief_title: str
    brief_category: str
    matching_mode: str = Field(..., description="'semantic' (all-MiniLM-L6-v2) or 'deterministic_fallback'")
    model_name: Optional[str] = "all-MiniLM-L6-v2"
    total_candidates_evaluated: int
    total_matches: int
    disclaimer: str = "Scores are heuristic compatibility estimates, not guaranteed hiring success probabilities."
    matches: List[CreatorMatch]

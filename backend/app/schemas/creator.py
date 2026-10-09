from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.portfolio import PortfolioItemResponse


class AvailabilityEnum(str):
    AVAILABLE = "Available Now"
    BOOKING = "Booking Next Month"


class CreatorProfileBase(BaseModel):
    headline: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = Field(None, max_length=3000)
    specialization: Optional[str] = Field(None, max_length=100)
    skills: List[str] = Field(default_factory=list)
    ai_tools: List[str] = Field(default_factory=list)
    availability: str = Field(default="Available Now")
    cover_url: Optional[str] = None


class CreatorProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = None
    headline: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = Field(None, max_length=3000)
    specialization: Optional[str] = Field(None, max_length=100)
    skills: Optional[List[str]] = None
    ai_tools: Optional[List[str]] = None
    availability: Optional[str] = None
    cover_url: Optional[str] = None


class CreatorProfileResponse(CreatorProfileBase):
    id: str  # user_id or slug identifier
    user_id: str
    display_name: str
    avatar_url: Optional[str] = None
    location: Optional[str] = "Global"
    rating: float = 5.0
    reviews_count: int = 0
    projects_count: int = 0
    starting_price: int = 1500
    price_unit: str = "project"
    verification: Optional[Dict[str, Any]] = None
    portfolio_items: List[PortfolioItemResponse] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class CreatorListResponse(BaseModel):
    items: List[CreatorProfileResponse]
    total: int
    limit: int
    offset: int

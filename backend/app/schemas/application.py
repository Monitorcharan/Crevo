from datetime import datetime
from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator



class ApplicationStatusEnum(str, Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ApplicationBase(BaseModel):
    proposal: str = Field("", max_length=3000)
    cover_letter: Optional[str] = None
    proposed_rate: Optional[int] = Field(None, ge=0)
    estimated_timeline: Optional[str] = None
    portfolio_item_ids: List[str] = Field(default_factory=list)
    portfolio_sample_urls: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def sync_proposal_and_cover_letter(cls, data: Any) -> Any:
        if isinstance(data, dict):
            prop = data.get("proposal") or data.get("cover_letter") or ""
            data["proposal"] = prop
            data["cover_letter"] = prop
        return data


class ApplicationCreate(ApplicationBase):
    pass



class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum


class CreatorSummary(BaseModel):
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    specialization: Optional[str] = None
    rating: Optional[float] = 5.0
    starting_price: Optional[int] = None
    ai_tools: List[str] = Field(default_factory=list)


class ApplicationResponse(ApplicationBase):
    id: str
    brief_id: str
    creator_id: str
    status: ApplicationStatusEnum
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    creator: Optional[CreatorSummary] = None
    model_config = ConfigDict(from_attributes=True)


class ApplicationListResponse(BaseModel):
    items: List[ApplicationResponse]
    total: int

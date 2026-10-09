from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ContentTypeEnum(str, Enum):
    VIDEO = "video"
    ANIMATION = "animation"
    IMAGE = "image"
    AD = "ad"
    GRAPHIC_DESIGN = "graphic_design"


class BriefStatusEnum(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"


class BriefBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    brand_name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=5000)
    creative_objective: str = Field(..., min_length=5, max_length=2000)
    content_type: ContentTypeEnum = ContentTypeEnum.VIDEO
    visual_style: Optional[str] = Field(None, max_length=1000)
    aspect_ratio: Optional[str] = Field("16:9", max_length=20)
    duration: Optional[str] = Field(None, max_length=50)
    ai_tools_preferred: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)
    budget_min: Optional[int] = Field(None, ge=0)
    budget_max: Optional[int] = Field(None, ge=0)
    currency: str = Field("USD", max_length=10)
    deadline: Optional[date] = None
    commercial_use_requirements: Optional[str] = Field(None, max_length=1500)
    licensing_expectations: Optional[str] = Field(None, max_length=1500)
    revision_expectations: Optional[str] = Field("2 rounds of generative iterations included", max_length=1000)
    status: BriefStatusEnum = BriefStatusEnum.PUBLISHED


class BriefCreate(BriefBase):
    pass


class BriefUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    brand_name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    creative_objective: Optional[str] = Field(None, min_length=5, max_length=2000)
    content_type: Optional[ContentTypeEnum] = None
    visual_style: Optional[str] = None
    aspect_ratio: Optional[str] = None
    duration: Optional[str] = None
    ai_tools_preferred: Optional[List[str]] = None
    deliverables: Optional[List[str]] = None
    budget_min: Optional[int] = Field(None, ge=0)
    budget_max: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = None
    deadline: Optional[date] = None
    commercial_use_requirements: Optional[str] = None
    licensing_expectations: Optional[str] = None
    revision_expectations: Optional[str] = None
    status: Optional[BriefStatusEnum] = None


class BriefResponse(BriefBase):
    id: str
    owner_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    applications_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)


class BriefListResponse(BaseModel):
    items: List[BriefResponse]
    total: int
    limit: int
    offset: int


class AIGenerateBriefRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1000)
    brand_name: Optional[str] = Field(None, max_length=100)


class AIGenerateBriefResponse(BaseModel):
    title: str
    brand_name: str
    description: str
    creative_objective: str
    content_type: ContentTypeEnum
    visual_style: str
    aspect_ratio: str
    duration: Optional[str] = None
    ai_tools_preferred: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)
    suggested_revision_expectations: str
    # Note: AI must NOT invent confirmed budgets, deadlines, licensing, or commercial rights
    budget_guidance: Optional[str] = "Confirm budget with your finance / procurement team"
    licensing_guidance: Optional[str] = "Specify licensing requirements (e.g. perpetual buyout vs term broadcast)"

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CommercialStatusEnum(str, Enum):
    CLEARED = "cleared"
    RESTRICTED = "restricted"
    NOT_CLEARED = "not_cleared"


class MediaTypeEnum(str, Enum):
    VIDEO = "video"
    ANIMATION = "animation"
    AD = "ad"
    IMAGE = "image"


class PortfolioItemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=2000)
    media_url: str = Field(...)
    media_type: MediaTypeEnum = MediaTypeEnum.IMAGE
    tools_used: List[str] = Field(default_factory=list)
    workflow_description: Optional[str] = Field(None, max_length=4000)
    commercial_use_status: CommercialStatusEnum = CommercialStatusEnum.NOT_CLEARED


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=2000)
    media_url: Optional[str] = None
    media_type: Optional[MediaTypeEnum] = None
    tools_used: Optional[List[str]] = None
    workflow_description: Optional[str] = Field(None, max_length=4000)
    commercial_use_status: Optional[CommercialStatusEnum] = None


class PortfolioItemResponse(PortfolioItemBase):
    id: str
    creator_id: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

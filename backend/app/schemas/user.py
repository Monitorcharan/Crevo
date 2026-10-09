from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RoleEnum(str, Enum):
    CREATOR = "creator"
    BRAND = "brand"


class ProfileBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    avatar_url: Optional[str] = None
    role: RoleEnum = RoleEnum.CREATOR


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = None


class ProfileResponse(ProfileBase):
    id: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

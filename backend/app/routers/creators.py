from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from app.db.supabase import repo
from app.core.security import get_current_creator
from app.schemas.creator import CreatorListResponse, CreatorProfileResponse, CreatorProfileUpdate
from app.schemas.portfolio import PortfolioItemResponse

router = APIRouter(prefix="/api/creators", tags=["Creators"])


@router.get("", response_model=CreatorListResponse)
async def list_creators(
    search: Optional[str] = Query(None, description="Search by name, headline, bio, skills, or tools"),
    specialization: Optional[str] = Query(None, description="Filter by creative specialization"),
    tool: Optional[str] = Query(None, description="Filter by AI tool used"),
    availability: Optional[str] = Query(None, description="Filter by availability status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    Search and filter verified generative AI creators with pagination.
    """
    data = await repo.get_creators(
        search=search,
        specialization=specialization,
        ai_tool=tool,
        availability=availability,
        limit=limit,
        offset=offset,
    )
    return data


@router.get("/{creator_id}", response_model=CreatorProfileResponse)
async def get_creator(creator_id: str):
    """
    Retrieve full creator profile dossier, including portfolio case studies and verification status.
    """
    creator = await repo.get_creator_by_id(creator_id)
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creator with ID or slug '{creator_id}' was not found",
        )
    return creator


@router.patch("/me", response_model=CreatorProfileResponse)
async def update_my_creator_profile(
    payload: CreatorProfileUpdate,
    current_user: dict = Depends(get_current_creator),
):
    """
    Update the authenticated creator's profile details.
    """
    user_id = current_user["id"]
    updated = await repo.update_creator_profile(user_id, payload.model_dump())
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update creator profile",
        )
    return updated


@router.get("/{creator_id}/portfolio", response_model=list[PortfolioItemResponse])
async def get_creator_portfolio(creator_id: str):
    """
    Retrieve all portfolio items and generative case studies for a specific creator.
    """
    items = await repo.get_creator_portfolio(creator_id)
    return items

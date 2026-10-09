from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user, get_current_brand
from app.db.supabase import repo
from app.schemas.brief import (
    BriefCreate,
    BriefUpdate,
    BriefResponse,
    BriefListResponse,
)
from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_engine import compute_recommendations_for_brief

router = APIRouter(prefix="/api/briefs", tags=["Creative Briefs"])


@router.get("", response_model=BriefListResponse)
async def list_briefs(
    status: Optional[str] = Query(None, description="Filter by brief status (e.g. published, draft)"),
    owner_id: Optional[str] = Query(None, description="Filter by brand owner user ID"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    List published creative briefs with pagination, status filtering, and keyword search.
    """
    data = await repo.list_briefs(status=status, owner_id=owner_id, search=search, limit=limit, offset=offset)
    return data


@router.get("/{brief_id}", response_model=BriefResponse)
async def get_brief(brief_id: str):
    """
    Retrieve full details for a single creative brief.
    """
    brief = await repo.get_brief_by_id(brief_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief with ID '{brief_id}' was not found",
        )
    return brief


@router.post("", response_model=BriefResponse, status_code=status.HTTP_201_CREATED)
async def create_brief(
    brief_in: BriefCreate,
    current_user: dict = Depends(get_current_brand),
):
    """
    Create a new creative brief. Requires authenticated Brand or Agency account.
    """
    created = await repo.create_brief(
        owner_id=current_user["id"],
        brief_data=brief_in.model_dump(),
    )
    return created


@router.patch("/{brief_id}", response_model=BriefResponse)
async def update_brief(
    brief_id: str,
    brief_update: BriefUpdate,
    current_user: dict = Depends(get_current_brand),
):
    """
    Update an existing brief. Only the owning Brand may modify its briefs.
    """
    existing = await repo.get_brief_by_id(brief_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief with ID '{brief_id}' was not found",
        )

    if existing.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify creative briefs belonging to another brand",
        )

    updated = await repo.update_brief(
        brief_id=brief_id,
        owner_id=current_user["id"],
        update_data=brief_update.model_dump(exclude_unset=True),
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update brief",
        )
    return updated


@router.delete("/{brief_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brief(
    brief_id: str,
    current_user: dict = Depends(get_current_brand),
):
    """
    Delete a creative brief. Ownership enforced.
    """
    existing = await repo.get_brief_by_id(brief_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief with ID '{brief_id}' was not found",
        )

    if existing.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete creative briefs belonging to another brand",
        )

    deleted = await repo.delete_brief(brief_id=brief_id, owner_id=current_user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete brief",
        )
    return None


@router.get("/{brief_id}/recommendations", response_model=RecommendationResponse)
async def get_brief_recommendations(brief_id: str, limit: int = Query(5, ge=1, le=20)):
    """
    Returns explainable creator recommendations based on tool stack, specialization,
    and portfolio relevance for a given brief.
    """
    brief = await repo.get_brief_by_id(brief_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief with ID '{brief_id}' was not found",
        )

    # Fetch all creators and portfolio items
    creators_data = await repo.get_creators(limit=50)
    creators = creators_data.get("items", [])
    portfolios = await repo.get_all_portfolios()

    recommendations = compute_recommendations_for_brief(brief, creators, portfolios, limit=limit)
    return RecommendationResponse(
        brief_id=brief_id,
        recommendations=recommendations,
        total_matches=len(recommendations),
    )

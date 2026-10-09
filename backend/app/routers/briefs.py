from typing import Optional, List
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
from app.schemas.matching import MatchResponse
from app.services.recommendation_engine import compute_recommendations_for_brief
from app.services.matching_engine import matching_engine

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


@router.get("/{brief_id}/matches", response_model=MatchResponse)
async def get_brief_matches(
    brief_id: str,
    mandatory_tools: Optional[str] = Query(None, description="Comma-separated list of mandatory required AI tools"),
    min_score: float = Query(0.0, ge=0.0, le=100.0, description="Minimum overall match score filter"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of matched creators to return"),
    current_user: dict = Depends(get_current_user),
):
    """
    AI-Powered Hybrid Creator Matching Engine.
    Executes mandatory pre-ranking constraint checks, semantic similarity with all-MiniLM-L6-v2,
    and multi-factor weighted scoring (35% portfolio, 25% skills, 20% tools, 15% format, 5% availability).
    Only authorized brand owners or platform admins may access private draft briefs and their matches.
    """
    brief = await repo.get_brief_by_id(brief_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief with ID '{brief_id}' was not found",
        )

    # Authorization enforcement:
    # If the brief is in draft status, only the owning brand (or admin) can view recommendations/matches.
    if brief.get("status") == "draft":
        if current_user.get("id") != brief.get("owner_id") and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view matches for a private draft brief belonging to another brand",
            )

    # Creators cannot view matches if not allowed (brands and agency accounts explore creator matches)
    if current_user.get("role") == "creator" and brief.get("owner_id") != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Creator accounts are not authorized to inspect brand matching recommendations",
        )

    # Parse mandatory tools parameter if supplied
    tools_list: Optional[List[str]] = None
    if mandatory_tools and mandatory_tools.strip():
        tools_list = [t.strip() for t in mandatory_tools.split(",") if t.strip()]

    # Retrieve candidate creators and their portfolios
    creators_data = await repo.get_creators(limit=100)
    creators = creators_data.get("items", [])
    portfolios = await repo.get_all_portfolios()

    # Run AI-powered hybrid matching engine
    match_response = matching_engine.match_creators_for_brief(
        brief=brief,
        creators=creators,
        portfolios=portfolios,
        mandatory_tools=tools_list,
        min_score=min_score,
        limit=limit,
    )
    return match_response


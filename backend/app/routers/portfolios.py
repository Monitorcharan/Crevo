from fastapi import APIRouter, HTTPException, status, Depends
from app.db.supabase import repo
from app.core.security import get_current_creator
from app.schemas.portfolio import (
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemResponse,
)

router = APIRouter(prefix="/api/portfolio", tags=["Portfolios"])


@router.post("", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio_item(
    payload: PortfolioItemCreate,
    current_user: dict = Depends(get_current_creator),
):
    """
    Publish a new portfolio piece / generative case study for the authenticated creator.
    """
    creator_id = current_user["id"]
    created = await repo.create_portfolio_item(creator_id, payload.model_dump())
    return created


@router.patch("/{item_id}", response_model=PortfolioItemResponse)
async def update_portfolio_item(
    item_id: str,
    payload: PortfolioItemUpdate,
    current_user: dict = Depends(get_current_creator),
):
    """
    Update an existing portfolio piece owned by the authenticated creator.
    """
    creator_id = current_user["id"]
    updated = await repo.update_portfolio_item(item_id, creator_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio item '{item_id}' not found or not owned by you",
        )
    return updated


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_item(
    item_id: str,
    current_user: dict = Depends(get_current_creator),
):
    """
    Delete a portfolio item owned by the authenticated creator.
    """
    creator_id = current_user["id"]
    deleted = await repo.delete_portfolio_item(item_id, creator_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Portfolio item '{item_id}' not found or not owned by you",
        )
    return None

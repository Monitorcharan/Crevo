from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, get_current_creator, get_current_brand
from app.db.supabase import repo
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    ApplicationListResponse,
)

router = APIRouter(tags=["Creator Applications"])


@router.post("/api/briefs/{brief_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_brief(
    brief_id: str,
    app_in: ApplicationCreate,
    current_user: dict = Depends(get_current_creator),
):
    """
    Submit a creator application and pitch for a published creative brief.
    """
    brief = await repo.get_brief_by_id(brief_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief '{brief_id}' was not found",
        )

    if brief.get("status") not in ("published", "in_progress"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Applications can only be submitted to published briefs",
        )

    # Check if already applied
    existing_apps = await repo.list_brief_applications(brief_id=brief_id, creator_id=current_user["id"])
    if existing_apps:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted an application for this brief",
        )

    created = await repo.create_application(
        brief_id=brief_id,
        creator_id=current_user["id"],
        app_data=app_in.model_dump(),
    )
    return created


@router.get("/api/briefs/{brief_id}/applications", response_model=ApplicationListResponse)
async def list_applications_for_brief(
    brief_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve all creator applications for a brief. Only the owning Brand can view proposals.
    """
    brief = await repo.get_brief_by_id(brief_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creative brief '{brief_id}' was not found",
        )

    if brief.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owning brand may review creator applications for this brief",
        )

    apps = await repo.list_brief_applications(brief_id=brief_id)
    return {"items": apps, "total": len(apps)}


@router.get("/api/creators/me/applications", response_model=ApplicationListResponse)
async def list_my_applications(
    current_user: dict = Depends(get_current_creator),
):
    """
    List all applications submitted by the authenticated creator.
    """
    apps = await repo.list_brief_applications(creator_id=current_user["id"])
    return {"items": apps, "total": len(apps)}


@router.patch("/api/applications/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: str,
    status_in: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_brand),
):
    """
    Update the status of an application (shortlisted, accepted, rejected).
    Enforces that the current brand owns the associated brief.
    """
    application = await repo.get_application_by_id(app_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{app_id}' was not found",
        )

    brief = await repo.get_brief_by_id(application.get("brief_id"))
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated creative brief could not be found",
        )

    if brief.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update applications on another brand's brief",
        )

    updated = await repo.update_application_status(app_id=app_id, status=status_in.status.value)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update application status",
        )
    return updated

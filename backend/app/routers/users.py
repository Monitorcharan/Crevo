from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.user import ProfileResponse, ProfileCreate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me")
async def get_my_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get authenticated user information, extracted securely from the validated Supabase JWT claims.
    """
    return {
        "id": current_user["id"],
        "email": current_user.get("email"),
        "role": current_user.get("role", "creator"),
        "display_name": current_user.get("display_name"),
    }


@router.post("/profile", response_model=ProfileResponse)
async def initialize_profile(
    payload: ProfileCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Initialize or sync user profile with role selection upon registration.
    """
    return {
        "id": current_user["id"],
        "display_name": payload.display_name,
        "avatar_url": payload.avatar_url,
        "role": payload.role,
    }

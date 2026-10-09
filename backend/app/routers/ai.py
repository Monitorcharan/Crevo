from fastapi import APIRouter, HTTPException, status
from app.schemas.brief import AIGenerateBriefRequest, AIGenerateBriefResponse
from app.services.ai_brief_generator import generate_brief_from_prompt

router = APIRouter(prefix="/api/ai", tags=["AI Generative Brief Studio"])


@router.post("/generate-brief", response_model=AIGenerateBriefResponse)
async def generate_brief(request: AIGenerateBriefRequest):
    """
    Generate a structured creative brief draft from a natural language prompt.
    Does NOT invent unconfirmed commercial boundaries (budget, deadlines, or licenses).
    """
    if not request.prompt or len(request.prompt.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Prompt must contain at least 5 characters describing the creative concept",
        )

    response = generate_brief_from_prompt(
        prompt=request.prompt,
        brand_name=request.brand_name,
    )
    return response

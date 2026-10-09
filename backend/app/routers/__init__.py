from app.routers.creators import router as creators_router
from app.routers.portfolios import router as portfolios_router
from app.routers.users import router as users_router
from app.routers.briefs import router as briefs_router
from app.routers.applications import router as applications_router
from app.routers.ai import router as ai_router

__all__ = [
    "creators_router",
    "portfolios_router",
    "users_router",
    "briefs_router",
    "applications_router",
    "ai_router",
]

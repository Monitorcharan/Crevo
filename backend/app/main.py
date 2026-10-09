import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    creators_router,
    portfolios_router,
    users_router,
    briefs_router,
    applications_router,
    ai_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("crevo.main")

app = FastAPI(
    title="Crevo AI Creator Marketplace API",
    description="Backend API powering AI creator discovery, portfolio provenance, and Supabase integration.",
    version="1.0.0",
)

# Configure CORS
origins = list(settings.CORS_ORIGINS) if isinstance(settings.CORS_ORIGINS, (list, tuple)) else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(creators_router)
app.include_router(portfolios_router)
app.include_router(users_router)
app.include_router(briefs_router)
app.include_router(applications_router)
app.include_router(ai_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint reporting API status and Supabase connectivity mode.
    """
    return {
        "status": "healthy",
        "service": "crevo-api",
        "version": "1.0.0",
        "supabase_connected": settings.is_supabase_configured,
        "mode": "live-supabase" if settings.is_supabase_configured else "demo-seed",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "Crevo AI Creator Marketplace API",
        "status": "active",
        "docs_url": "/docs",
        "health_url": "/health",
    }

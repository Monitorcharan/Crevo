import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

BRAND_HEADERS = {"Authorization": "Bearer test-brand-token"}
CREATOR_HEADERS = {"Authorization": "Bearer test-creator-token"}


@pytest.mark.asyncio
async def test_list_briefs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/briefs")
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1


@pytest.mark.asyncio
async def test_get_brief_by_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001")
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Hyperion Apex: Autonomous Electric Scooter Launch Film"
        assert data["content_type"] == "video"


@pytest.mark.asyncio
async def test_create_brief_as_brand():
    payload = {
        "title": "Quantum Chrono: Luxury Watch Film",
        "brand_name": "Aura Horology",
        "description": "A high-concept 45s launch film depicting quantum mechanics inside luxury timepieces.",
        "creative_objective": "Position Aura as the bleeding edge of mechanical horology.",
        "content_type": "video",
        "visual_style": "Macro anamorphic, dark chrome and copper accents",
        "aspect_ratio": "16:9",
        "duration": "45 seconds",
        "ai_tools_preferred": ["Runway Gen-3", "ComfyUI"],
        "deliverables": ["1x 45s Master Video"],
        "budget_min": 4000,
        "budget_max": 7500,
        "status": "published",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/briefs", json=payload, headers=BRAND_HEADERS)
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == payload["title"]
        assert data["owner_id"] in ("00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000010")



@pytest.mark.asyncio
async def test_create_brief_as_creator_rejected():
    payload = {
        "title": "Illegal Creator Brief",
        "brand_name": "Fake Brand",
        "description": "Should be rejected because user is a creator.",
        "creative_objective": "Test security.",
        "content_type": "image",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/briefs", json=payload, headers=CREATOR_HEADERS)
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_brief_recommendations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001/recommendations")
        assert res.status_code == 200
        data = res.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) >= 1
        first = data["recommendations"][0]
        assert "match_score" in first
        assert "match_reasons" in first
        assert len(first["match_reasons"]) > 0

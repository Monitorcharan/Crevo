import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

BRAND_HEADERS = {"Authorization": "Bearer test-brand-token"}
CREATOR_HEADERS = {"Authorization": "Bearer test-creator-token"}


@pytest.mark.asyncio
async def test_apply_to_brief_as_brand_rejected():
    payload = {
        "proposal": "Brands should not be able to apply to briefs.",
        "proposed_rate": 2000,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/briefs/20000000-0000-0000-0000-000000000002/apply", json=payload, headers=BRAND_HEADERS)
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_list_applications_for_brief_unauthorized_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Creator tries to review applications on a brief they don't own
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001/applications", headers=CREATOR_HEADERS)
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_creator_view_own_applications():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/creators/me/applications", headers=CREATOR_HEADERS)
        assert res.status_code == 200
        data = res.json()
        assert "items" in data

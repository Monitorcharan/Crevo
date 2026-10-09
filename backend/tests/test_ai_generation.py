import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_generate_brief_valid_prompt():
    payload = {
        "prompt": "Create a cinematic 30-second advertisement for a futuristic electric scooter.",
        "brand_name": "Hyperion Motors",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/ai/generate-brief", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "title" in data
        assert "description" in data
        assert data["content_type"] == "video"
        assert "Runway Gen-3" in data["ai_tools_preferred"] or "Kling AI" in data["ai_tools_preferred"]
        assert len(data["deliverables"]) > 0
        assert "budget" in data.get("budget_guidance", "").lower()


@pytest.mark.asyncio
async def test_generate_brief_short_prompt_rejected():
    payload = {
        "prompt": "hi",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/ai/generate-brief", json=payload)
        assert res.status_code == 422

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.services.matching_engine import matching_engine


# Demo brief and creator test fixtures
MOCK_BRIEF_SCOOTER = {
    "id": "20000000-0000-0000-0000-000000000001",
    "owner_id": "00000000-0000-0000-0000-000000000010",
    "title": "Hyperion Apex: Autonomous Electric Scooter Launch Film",
    "brand_name": "Hyperion Mobility",
    "description": "Create a high-octane 30-second cinematic launch commercial showcasing the Hyperion Apex electric scooter gliding through a rainy neo-cyberpunk metropolis with neon puddle reflections.",
    "creative_objective": "Drive pre-orders among urban tech professionals and position Hyperion as the premium apex of personal electric transit.",
    "content_type": "video",
    "visual_style": "Neo-noir cyberpunk, high-contrast anamorphic lens flares, rain-slicked asphalt, vibrant violet and teal reflections.",
    "ai_tools_preferred": ["Runway Gen-3", "Kling AI", "Midjourney v6"],
    "commercial_use_requirements": "Full commercial buyout with worldwide digital and broadcast rights across web, social, and CTV.",
    "status": "published",
}

MOCK_BRIEF_PRIVATE_DRAFT = {
    "id": "20000000-0000-0000-0000-000000000099",
    "owner_id": "00000000-0000-0000-0000-000000000010",
    "title": "Secret Stealth Mode Project",
    "brand_name": "Hyperion Labs",
    "description": "Unannounced prototype reveal film.",
    "creative_objective": "Internal investor showcase.",
    "content_type": "video",
    "status": "draft",
}

MOCK_CREATORS = [
    {
        "id": "c1",
        "user_id": "c1",
        "display_name": "Elena Vance",
        "specialization": "AI Filmmaking",
        "skills": ["Cinematic Direction", "Motion Prompting", "Sound Design", "Color Grading"],
        "ai_tools": ["Runway Gen-3", "Midjourney v6", "Kling AI", "ComfyUI"],
        "availability": "Available Now",
        "portfolio_items": [
            {
                "id": "p1",
                "creator_id": "c1",
                "title": "Nebula Prime: First Contact",
                "description": "An atmospheric sci-fi film still capturing an astronaut encountering a sentient cosmic nebula. Synthesized using multi-prompt camera tracking.",
                "media_type": "video",
                "tools_used": ["Runway Gen-3", "Midjourney v6"],
                "workflow_description": "Generated 14 distinct motion sequences in Runway Gen-3.",
                "commercial_use_status": "cleared",
            }
        ],
    },
    {
        "id": "c2",
        "user_id": "c2",
        "display_name": "Marcus Sterling",
        "specialization": "Product Ads",
        "skills": ["Commercial Prompting", "Product Staging", "Diffusion Lighting"],
        "ai_tools": ["Midjourney v6", "Flux.1", "Magnific AI"],
        "availability": "Available Now",
        "portfolio_items": [
            {
                "id": "p2",
                "creator_id": "c2",
                "title": "Ethereal Essence: Luxury Fragrance Campaign",
                "description": "Commercial still campaign for a luxury fragrance brand showcasing sculpted glass flacons.",
                "media_type": "ad",
                "tools_used": ["Flux.1", "Midjourney v6"],
                "workflow_description": "Synthesized with Flux.1 Pro utilizing controlled glass caustics.",
                "commercial_use_status": "cleared",
            }
        ],
    },
    {
        "id": "c3_unlicensed",
        "user_id": "c3_unlicensed",
        "display_name": "Unlicensed Hobbyist",
        "specialization": "AI Filmmaking",
        "skills": ["Video Prompting"],
        "ai_tools": ["Runway Gen-3"],
        "availability": "Available Now",
        "portfolio_items": [
            {
                "id": "p3",
                "creator_id": "c3_unlicensed",
                "title": "Personal Fun Clip",
                "description": "Personal fan video not cleared for commercial use.",
                "media_type": "video",
                "tools_used": ["Runway Gen-3"],
                "workflow_description": "Experiment.",
                "commercial_use_status": "not_cleared",
            }
        ],
    },
    {
        "id": "c4_no_portfolio",
        "user_id": "c4_no_portfolio",
        "display_name": "New Creator",
        "specialization": "AI Filmmaking",
        "skills": ["Cinematography"],
        "ai_tools": ["Runway Gen-3"],
        "availability": "Available Now",
        "portfolio_items": [],
    },
]


def test_ranking_consistency():
    """Matching engine should produce deterministic ranking order for identical inputs."""
    res1 = matching_engine.match_creators_for_brief(
        brief=MOCK_BRIEF_SCOOTER,
        creators=MOCK_CREATORS,
        portfolios=[],
    )
    res2 = matching_engine.match_creators_for_brief(
        brief=MOCK_BRIEF_SCOOTER,
        creators=MOCK_CREATORS,
        portfolios=[],
    )

    assert len(res1.matches) == len(res2.matches)
    for m1, m2 in zip(res1.matches, res2.matches):
        assert m1.creator_id == m2.creator_id
        assert m1.match_score == m2.match_score


def test_mandatory_filter_content_format():
    """Creator must produce or specialize in requested content format."""
    graphic_brief = dict(MOCK_BRIEF_SCOOTER, content_type="graphic_design")
    pure_video_creator = {
        "id": "c_pure_video",
        "specialization": "AI Filmmaking",
        "skills": ["Camera Tracking"],
        "ai_tools": ["Runway Gen-3"],
        "portfolio_items": [
            {"media_type": "video", "commercial_use_status": "cleared", "tools_used": []}
        ],
    }

    res = matching_engine.match_creators_for_brief(
        brief=graphic_brief,
        creators=[pure_video_creator],
        portfolios=[],
    )
    # Creator does not specialize in graphic_design or have graphic items
    assert len(res.matches) == 0


def test_mandatory_filter_explicit_tool():
    """If mandatory tool is specified, creators missing that tool must be excluded."""
    res = matching_engine.match_creators_for_brief(
        brief=MOCK_BRIEF_SCOOTER,
        creators=MOCK_CREATORS,
        portfolios=[],
        mandatory_tools=["Kling AI"],
    )
    # Elena has Kling AI, Marcus and others do not
    matched_ids = [m.creator_id for m in res.matches]
    assert "c1" in matched_ids
    assert "c2" not in matched_ids


def test_commercial_use_restriction_enforcement():
    """Commercial-use requirement must reject creators without verified cleared works."""
    # MOCK_BRIEF_SCOOTER has strict commercial buyout requirement
    res = matching_engine.match_creators_for_brief(
        brief=MOCK_BRIEF_SCOOTER,
        creators=[MOCK_CREATORS[2]],  # c3_unlicensed has only not_cleared items
        portfolios=[],
    )
    assert len(res.matches) == 0, "Creator with only not_cleared portfolio must be rejected for commercial brief"


def test_missing_portfolio_graceful_handling():
    """Creator without portfolio items should receive 0 portfolio score without crashing."""
    brief_no_commercial = dict(MOCK_BRIEF_SCOOTER, commercial_use_requirements=None)
    creator_no_port = MOCK_CREATORS[3]  # c4_no_portfolio

    res = matching_engine.match_creators_for_brief(
        brief=brief_no_commercial,
        creators=[creator_no_port],
        portfolios=[],
    )
    assert len(res.matches) == 1
    match = res.matches[0]
    assert match.score_breakdown.portfolio_score == 0.0
    assert len(match.relevant_portfolio_items) == 0


def test_empty_creator_dataset():
    """Matching engine must cleanly return 0 matches for empty creator dataset."""
    res = matching_engine.match_creators_for_brief(
        brief=MOCK_BRIEF_SCOOTER,
        creators=[],
        portfolios=[],
    )
    assert res.total_candidates_evaluated == 0
    assert res.total_matches == 0
    assert len(res.matches) == 0


def test_score_breakdown_weights_calculation():
    """Overall score must correctly apply 35/25/20/15/5 weights."""
    brief_no_commercial = dict(MOCK_BRIEF_SCOOTER, commercial_use_requirements=None)
    res = matching_engine.match_creators_for_brief(
        brief=brief_no_commercial,
        creators=[MOCK_CREATORS[0]],  # Elena Vance
        portfolios=[],
    )
    assert len(res.matches) == 1
    m = res.matches[0]
    bd = m.score_breakdown
    expected = round(
        0.35 * bd.portfolio_score +
        0.25 * bd.skills_score +
        0.20 * bd.tools_score +
        0.15 * bd.format_score +
        0.05 * bd.availability_score,
        1,
    )
    assert abs(m.match_score - expected) <= 0.2
    assert 0.0 <= m.match_score <= 100.0


@pytest.mark.asyncio
async def test_get_matches_api_success():
    """GET /api/briefs/{brief_id}/matches returns structured matching response."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = {"Authorization": "Bearer test-brand-token"}
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001/matches", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "matches" in data
        assert "matching_mode" in data
        assert data["total_matches"] > 0
        top = data["matches"][0]
        assert "score_breakdown" in top
        assert "explanation" in top
        assert "relevant_portfolio_items" in top


@pytest.mark.asyncio
async def test_get_matches_api_unauthorized_creator():
    """Creator account cannot access brand matching recommendations."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = {"Authorization": "Bearer test-creator-token"}
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001/matches", headers=headers)
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_get_matches_api_unauthenticated():
    """Unauthenticated request must be rejected with 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/briefs/20000000-0000-0000-0000-000000000001/matches")
        assert res.status_code == 401


"""
Explainable Creator Recommendation Engine
Evaluates verified creator profiles against creative brief requirements using
transparent, multi-factor deterministic scoring:
1. Specialization alignment (weight: 35%)
2. AI tool compatibility (weight: 25%)
3. Skill & workflow overlap (weight: 20%)
4. Portfolio media format match (weight: 20%)

Structured for easy extension with vector embeddings / semantic retrieval in future steps.
"""

from typing import List, Dict, Any
from app.schemas.recommendation import RecommendedCreator


SPECIALIZATION_MAP = {
    "video": ["AI Filmmaking", "Animation", "Product Ads"],
    "animation": ["Animation", "AI Filmmaking"],
    "ad": ["Product Ads", "AI Art", "Graphic Design"],
    "image": ["AI Art", "AI Photography", "Product Ads"],
    "graphic_design": ["Graphic Design", "AI Art", "Product Ads"],
}


def score_creator_for_brief(creator: Dict[str, Any], brief: Dict[str, Any], portfolios: List[Dict[str, Any]]) -> RecommendedCreator:
    score = 0
    reasons: List[str] = []
    matched_tools: List[str] = []
    matched_skills: List[str] = []

    brief_tools = set(t.lower() for t in brief.get("ai_tools_preferred", []))
    creator_tools = set(t.lower() for t in creator.get("ai_tools", []))
    brief_content = brief.get("content_type", "video").lower()
    creator_spec = creator.get("specialization", "")
    creator_skills = set(s.lower() for s in creator.get("skills", []))

    # 1. Specialization Match (up to 35 points)
    allowed_specs = SPECIALIZATION_MAP.get(brief_content, [creator_spec])
    if creator_spec in allowed_specs:
        if creator_spec == allowed_specs[0]:
            score += 35
            reasons.append(f"Direct specialization match in {creator_spec} for {brief_content.upper()} format")
        else:
            score += 25
            reasons.append(f"Adjacent creative competency in {creator_spec}")
    else:
        score += 10

    # 2. AI Tool Stack Overlap (up to 25 points)
    common_tools = brief_tools.intersection(creator_tools)
    if common_tools:
        # Match percentage
        ratio = len(common_tools) / max(len(brief_tools), 1)
        tool_pts = min(25, int(ratio * 25) + 5)
        score += tool_pts
        matched_tool_names = [t for t in creator.get("ai_tools", []) if t.lower() in common_tools]
        matched_tools = matched_tool_names
        reasons.append(f"Certified active mastery of required tools: {', '.join(matched_tool_names[:3])}")
    elif creator.get("ai_tools"):
        score += 8

    # 3. Skills & Human Workflow Overlap (up to 20 points)
    brief_text = f"{brief.get('description', '')} {brief.get('visual_style', '')} {brief.get('creative_objective', '')}".lower()
    relevant_skills = [s for s in creator.get("skills", []) if s.lower() in brief_text or any(w in s.lower() for w in ["direction", "lighting", "color", "consistency", "storyboard"])]
    if relevant_skills:
        score += min(20, len(relevant_skills) * 5 + 5)
        matched_skills = relevant_skills[:4]
        reasons.append(f"Demonstrated core skills: {', '.join(relevant_skills[:3])}")
    else:
        score += 5

    # 4. Portfolio Media Format Verification (up to 20 points)
    creator_portfolios = [p for p in portfolios if p.get("creator_id") in [creator.get("user_id"), creator.get("id")]]
    relevant_sample = None
    has_format = any(p.get("media_type") == brief_content for p in creator_portfolios)
    has_cleared = any(p.get("commercial_use_status") == "cleared" for p in creator_portfolios)

    if has_format:
        score += 12
        matching_p = next((p for p in creator_portfolios if p.get("media_type") == brief_content), None)
        if matching_p:
            relevant_sample = matching_p.get("media_url")
            reasons.append(f"Verified case study on file: '{matching_p.get('title')}'")
    else:
        score += 5

    if has_cleared:
        score += 8
        reasons.append("Proven commercial IP buyout & rights clearance history")

    # Availability bonus
    if creator.get("availability") == "Available Now":
        score = min(100, score + 5)
        reasons.append("Currently available for immediate project commission")

    match_score = min(99, max(45, score))

    display_name = creator.get("display_name") or (creator.get("profiles", {}).get("display_name") if isinstance(creator.get("profiles"), dict) else None) or "Verified Creator"
    avatar_url = creator.get("avatar_url") or (creator.get("profiles", {}).get("avatar_url") if isinstance(creator.get("profiles"), dict) else None)

    return RecommendedCreator(
        creator_id=creator.get("user_id") or creator.get("id"),
        display_name=display_name,
        avatar_url=avatar_url,
        headline=creator.get("headline"),
        specialization=creator_spec,
        availability=creator.get("availability", "Available Now"),
        starting_price=creator.get("starting_price"),
        match_score=match_score,
        match_reasons=reasons,
        ai_tools_matched=matched_tools,
        skills_matched=matched_skills,
        relevant_portfolio_sample=relevant_sample,
    )


def compute_recommendations_for_brief(
    brief: Dict[str, Any],
    creators: List[Dict[str, Any]],
    portfolios: List[Dict[str, Any]],
    limit: int = 5,
) -> List[RecommendedCreator]:
    scored = [score_creator_for_brief(c, brief, portfolios) for c in creators]
    scored.sort(key=lambda x: x.match_score, reverse=True)
    return scored[:limit]

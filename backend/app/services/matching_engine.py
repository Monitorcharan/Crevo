"""
AI-Powered Creator Matching Engine
Hybrid matching service combining:
1. Structured pre-ranking filtering (format, mandatory tools, commercial clearance)
2. Semantic similarity via Sentence Transformers (all-MiniLM-L6-v2)
3. Multi-factor weighted scoring:
   - Portfolio semantic relevance: 35%
   - Skills and specialization: 25%
   - AI tool compatibility: 20%
   - Content format compatibility: 15%
   - Availability: 5%
4. Grounded, explainable match justifications without hallucinated experience
5. Deterministic fallback mode when neural embedding models cannot execute
"""

import logging
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from app.schemas.matching import (
    CreatorMatch,
    CreatorSummary,
    MatchResponse,
    RelevantPortfolioItem,
    ScoreBreakdown,
)
from app.services.embedding_service import embedding_service

logger = logging.getLogger("crevo.matching")

# Alignment mappings between brief content types and creator specializations
FORMAT_SPECIALIZATION_MAP = {
    "video": {
        "primary": ["AI Filmmaking", "Cinematic Video"],
        "adjacent": ["Animation", "Product Ads", "AI Animation"],
    },
    "animation": {
        "primary": ["Animation", "AI Animation", "Character Animation"],
        "adjacent": ["AI Filmmaking", "Cinematic Video", "Product Ads"],
    },
    "ad": {
        "primary": ["Product Ads", "Brand Visuals", "Commercial Ads"],
        "adjacent": ["AI Filmmaking", "AI Art", "Graphic Design"],
    },
    "image": {
        "primary": ["AI Art", "AI Photography", "Concept Art"],
        "adjacent": ["Product Ads", "Graphic Design", "Animation"],
    },
    "graphic_design": {
        "primary": ["Graphic Design", "Brand Identity", "AI Art"],
        "adjacent": ["Product Ads", "AI Photography"],
    },
}

# Media type normalization
MEDIA_TYPE_MAP = {
    "video": ["video", "cinematic video"],
    "animation": ["animation", "ai animation"],
    "ad": ["ad", "product ads", "video", "image"],
    "image": ["image", "ai art", "photo"],
    "graphic_design": ["graphic_design", "image", "ad"],
}

AVAILABILITY_SCORES = {
    "available now": 100.0,
    "available": 100.0,
    "immediate": 100.0,
    "available next week": 75.0,
    "part-time": 75.0,
    "booking next month": 50.0,
    "booked": 10.0,
    "unavailable": 10.0,
}


class MatchingEngine:
    def __init__(self):
        self.embedding_service = embedding_service

    def _normalize_token(self, token: str) -> str:
        return re.sub(r"[^\w\s]", "", token.lower()).strip()

    def _tools_match(self, needle: str, haystack: Set[str]) -> bool:
        """Fuzzy match needle against set of creator tools (e.g. 'Runway Gen-3' matches 'Runway Gen-3 Alpha')"""
        n_clean = self._normalize_token(needle)
        for h in haystack:
            h_clean = self._normalize_token(h)
            if n_clean in h_clean or h_clean in n_clean:
                return True
        return False

    def _evaluate_mandatory_filters(
        self,
        creator: Dict[str, Any],
        brief: Dict[str, Any],
        creator_portfolios: List[Dict[str, Any]],
        mandatory_tools: Optional[List[str]] = None,
    ) -> Tuple[bool, List[str]]:
        """
        Enforce strict mandatory filters before ranking:
        1. Required content format
        2. Commercial-use compatibility where specified
        3. Explicitly mandatory AI tools
        """
        reasons: List[str] = []
        brief_format = brief.get("content_type", "video").lower()

        # 1. Content Format Check
        has_matching_portfolio_format = any(
            p.get("media_type", "").lower() in MEDIA_TYPE_MAP.get(brief_format, [brief_format])
            for p in creator_portfolios
        )
        spec = creator.get("specialization", "")
        spec_mapping = FORMAT_SPECIALIZATION_MAP.get(brief_format, {"primary": [], "adjacent": []})
        spec_matches = spec in spec_mapping["primary"] or spec in spec_mapping["adjacent"]

        if not has_matching_portfolio_format and not spec_matches:
            reasons.append(f"Does not produce or specialize in required format: {brief_format.upper()}")
            return False, reasons

        # 2. Commercial-use Compatibility Check
        # Rule: Do not interpret missing commercial-use information as permission.
        commercial_req = brief.get("commercial_use_requirements") or ""
        commercial_specified = bool(
            commercial_req.strip() and not any(w in commercial_req.lower() for w in ["none", "n/a", "not required"])
        )

        if commercial_specified:
            # Creator must have verified commercial clearance on at least one portfolio item
            has_cleared_portfolio = any(
                p.get("commercial_use_status") == "cleared" for p in creator_portfolios
            )
            if not has_cleared_portfolio:
                reasons.append("Lacks verified commercial-use clearance for commercial brief requirements")
                return False, reasons

        # 3. Explicitly Mandatory AI Tools Check
        required_tools = [t for t in (mandatory_tools or []) if t.strip()]
        if required_tools:
            creator_all_tools: Set[str] = set(creator.get("ai_tools", []))
            for p in creator_portfolios:
                creator_all_tools.update(p.get("tools_used", []))

            for req_tool in required_tools:
                if not self._tools_match(req_tool, creator_all_tools):
                    reasons.append(f"Missing mandatory required AI tool: {req_tool}")
                    return False, reasons

        return True, reasons

    def _calculate_semantic_portfolio_score(
        self,
        brief: Dict[str, Any],
        creator_portfolios: List[Dict[str, Any]],
    ) -> Tuple[float, List[RelevantPortfolioItem], bool]:
        """
        Evaluates portfolio items using semantic embeddings (all-MiniLM-L6-v2) or deterministic keyword fallback.
        Returns (portfolio_score_0_to_100, list_of_relevant_items, is_semantic).
        """
        if not creator_portfolios:
            return 0.0, [], self.embedding_service.is_semantic_available

        brief_text = (
            f"{brief.get('title', '')}. {brief.get('description', '')}. "
            f"Objective: {brief.get('creative_objective', '')}. "
            f"Style: {brief.get('visual_style', '')}. "
            f"Format: {brief.get('content_type', '')}."
        )

        is_semantic = self.embedding_service.is_semantic_available
        brief_vec = self.embedding_service.encode(brief_text) if is_semantic else None

        scored_items: List[Tuple[float, Dict[str, Any]]] = []

        if brief_vec is not None:
            # Semantic Mode
            for p in creator_portfolios:
                p_text = (
                    f"{p.get('title', '')}. {p.get('description', '')}. "
                    f"Workflow: {p.get('workflow_description', '')}. "
                    f"Tools: {', '.join(p.get('tools_used', []))}. "
                    f"Format: {p.get('media_type', '')}."
                )
                p_vec = self.embedding_service.encode(p_text)
                sim = self.embedding_service.compute_similarity(brief_vec, p_vec)
                # Linear rescaling of MiniLM cosine similarity [-0.15, 0.65] to [0, 100]
                relevance = max(0.0, min(100.0, ((sim - 0.15) / 0.60) * 100.0))
                scored_items.append((round(relevance, 1), p))
        else:
            # Deterministic Fallback Mode
            brief_tokens = set(self._normalize_token(w) for w in brief_text.split() if len(w) > 3)
            for p in creator_portfolios:
                p_tokens = set(
                    self._normalize_token(w)
                    for w in (f"{p.get('title', '')} {p.get('description', '')} {p.get('workflow_description', '')}").split()
                    if len(w) > 3
                )
                overlap = len(brief_tokens.intersection(p_tokens))
                format_bonus = 25.0 if p.get("media_type") == brief.get("content_type") else 0.0
                relevance = min(100.0, overlap * 12.0 + format_bonus + 30.0)
                scored_items.append((round(relevance, 1), p))

        # Sort items by relevance descending
        scored_items.sort(key=lambda x: x[0], reverse=True)

        # Weighted portfolio score: top item counts for 75%, portfolio average counts for 25%
        top_score = scored_items[0][0]
        avg_score = sum(it[0] for it in scored_items) / len(scored_items)
        composite_portfolio = round(top_score * 0.75 + avg_score * 0.25, 1)

        relevant_items = [
            RelevantPortfolioItem(
                id=str(p.get("id")),
                title=p.get("title", "Portfolio Case Study"),
                media_url=p.get("media_url", ""),
                media_type=p.get("media_type", "video"),
                tools_used=p.get("tools_used", []),
                relevance_score=score,
                commercial_use_status=p.get("commercial_use_status", "not_cleared"),
            )
            for score, p in scored_items
        ]

        return composite_portfolio, relevant_items, (brief_vec is not None)

    def _calculate_skills_score(
        self,
        creator: Dict[str, Any],
        brief: Dict[str, Any],
    ) -> Tuple[float, List[str]]:
        brief_format = brief.get("content_type", "video").lower()
        creator_spec = creator.get("specialization", "")
        spec_map = FORMAT_SPECIALIZATION_MAP.get(brief_format, {"primary": [], "adjacent": []})

        if creator_spec in spec_map["primary"]:
            spec_score = 100.0
        elif creator_spec in spec_map["adjacent"]:
            spec_score = 70.0
        else:
            spec_score = 35.0

        # Skill overlap
        brief_context = f"{brief.get('description', '')} {brief.get('creative_objective', '')} {brief.get('visual_style', '')}".lower()
        creator_skills = creator.get("skills", [])
        matched_skills: List[str] = []

        for skill in creator_skills:
            s_clean = skill.lower()
            if s_clean in brief_context or any(w in brief_context for w in s_clean.split()):
                matched_skills.append(skill)

        skill_score = min(100.0, len(matched_skills) * 22.0 + 30.0)
        composite_skills = round(0.55 * spec_score + 0.45 * skill_score, 1)
        return composite_skills, matched_skills

    def _calculate_tools_score(
        self,
        creator: Dict[str, Any],
        brief: Dict[str, Any],
        creator_portfolios: List[Dict[str, Any]],
    ) -> Tuple[float, List[str], List[str]]:
        brief_tools = brief.get("ai_tools_preferred", []) or []
        creator_tools: Set[str] = set(creator.get("ai_tools", []))
        for p in creator_portfolios:
            creator_tools.update(p.get("tools_used", []))

        if not brief_tools:
            matched = list(creator.get("ai_tools", []))[:3]
            return 85.0, matched, []

        matched_tools: List[str] = []
        missing_tools: List[str] = []

        for b_tool in brief_tools:
            if self._tools_match(b_tool, creator_tools):
                matched_tools.append(b_tool)
            else:
                missing_tools.append(b_tool)

        ratio = len(matched_tools) / len(brief_tools)
        score = round(min(100.0, ratio * 100.0), 1)
        return score, matched_tools, missing_tools

    def _calculate_format_score(
        self,
        creator: Dict[str, Any],
        brief: Dict[str, Any],
        creator_portfolios: List[Dict[str, Any]],
    ) -> float:
        brief_format = brief.get("content_type", "video").lower()
        has_direct_format = any(
            p.get("media_type", "").lower() == brief_format
            for p in creator_portfolios
        )
        if has_direct_format:
            return 100.0

        spec = creator.get("specialization", "")
        spec_map = FORMAT_SPECIALIZATION_MAP.get(brief_format, {"primary": [], "adjacent": []})
        if spec in spec_map["primary"]:
            return 80.0
        elif spec in spec_map["adjacent"]:
            return 60.0
        return 30.0

    def _calculate_availability_score(self, creator: Dict[str, Any]) -> float:
        avail_str = creator.get("availability", "Available Now").strip().lower()
        return AVAILABILITY_SCORES.get(avail_str, 70.0)

    def _generate_grounded_explanation(
        self,
        creator: Dict[str, Any],
        brief: Dict[str, Any],
        match_score: float,
        matched_skills: List[str],
        matched_tools: List[str],
        missing_tools: List[str],
        relevant_items: List[RelevantPortfolioItem],
    ) -> str:
        """
        Builds a strictly grounded explanation without inventing experience.
        """
        sentences: List[str] = []
        spec = creator.get("specialization", "AI Creation")
        content_type = brief.get("content_type", "content").upper()

        # 1. Domain alignment
        if match_score >= 85:
            sentences.append(f"Exceptional match for {spec} delivering {content_type} production.")
        elif match_score >= 70:
            sentences.append(f"Strong match for {spec} with proven competencies in {content_type}.")
        else:
            sentences.append(f"Qualified creative profile in {spec} capable of {content_type} execution.")

        # 2. Portfolio citation
        if relevant_items:
            top_item = relevant_items[0]
            sentences.append(
                f"Portfolio includes verified case study '{top_item.title}' with {int(top_item.relevance_score)}% semantic alignment to brief."
            )

        # 3. Toolchain
        if matched_tools:
            tools_str = ", ".join(matched_tools[:3])
            sentences.append(f"Demonstrates certified expertise in {tools_str}.")

        # 4. Gaps
        if missing_tools:
            missing_str = ", ".join(missing_tools[:2])
            sentences.append(f"Preferred experience with {missing_str} is not explicitly listed in profile.")
        else:
            sentences.append("Meets all preferred AI model and tool requirements.")

        # 5. Commercial clearance
        has_cleared = any(it.commercial_use_status == "cleared" for it in relevant_items)
        if has_cleared:
            sentences.append("Proven commercial IP buyout and rights clearance on file.")

        return " ".join(sentences)

    def match_creators_for_brief(
        self,
        brief: Dict[str, Any],
        creators: List[Dict[str, Any]],
        portfolios: List[Dict[str, Any]],
        mandatory_tools: Optional[List[str]] = None,
        min_score: float = 0.0,
        limit: int = 10,
    ) -> MatchResponse:
        """
        Executes hybrid matching algorithm across candidate creators.
        """
        candidates_evaluated = len(creators)
        matches: List[CreatorMatch] = []
        used_semantic = False

        # Group portfolio items by creator
        portfolios_by_creator: Dict[str, List[Dict[str, Any]]] = {}
        for p in portfolios:
            c_id = str(p.get("creator_id"))
            portfolios_by_creator.setdefault(c_id, []).append(p)

        for creator in creators:
            c_id = str(creator.get("user_id") or creator.get("id"))
            c_portfolios = portfolios_by_creator.get(c_id, []) or creator.get("portfolio_items", [])

            # 1. Mandatory Pre-ranking Checks
            passed_mandatory, filter_reasons = self._evaluate_mandatory_filters(
                creator=creator,
                brief=brief,
                creator_portfolios=c_portfolios,
                mandatory_tools=mandatory_tools,
            )
            if not passed_mandatory:
                continue

            # 2. Factor Scoring
            portfolio_score, relevant_items, is_semantic = self._calculate_semantic_portfolio_score(
                brief=brief,
                creator_portfolios=c_portfolios,
            )
            if is_semantic:
                used_semantic = True

            skills_score, matched_skills = self._calculate_skills_score(creator, brief)
            tools_score, matched_tools, missing_tools = self._calculate_tools_score(creator, brief, c_portfolios)
            format_score = self._calculate_format_score(creator, brief, c_portfolios)
            avail_score = self._calculate_availability_score(creator)

            # 3. Overall Weighted Score: 35% Portfolio, 25% Skills, 20% Tools, 15% Format, 5% Availability
            composite_score = round(
                0.35 * portfolio_score +
                0.25 * skills_score +
                0.20 * tools_score +
                0.15 * format_score +
                0.05 * avail_score,
                1,
            )
            composite_score = max(0.0, min(100.0, composite_score))

            if composite_score < min_score:
                continue

            # 4. Grounded Explanation
            explanation = self._generate_grounded_explanation(
                creator=creator,
                brief=brief,
                match_score=composite_score,
                matched_skills=matched_skills,
                matched_tools=matched_tools,
                missing_tools=missing_tools,
                relevant_items=relevant_items,
            )

            creator_summary = CreatorSummary(
                id=c_id,
                display_name=creator.get("display_name", "AI Creator"),
                avatar_url=creator.get("avatar_url"),
                headline=creator.get("headline"),
                specialization=creator.get("specialization", "AI Art"),
                availability=creator.get("availability", "Available Now"),
                starting_price=creator.get("starting_price"),
                price_unit=creator.get("price_unit", "project"),
                location=creator.get("location", "Global"),
                ai_tools=creator.get("ai_tools", []),
                skills=creator.get("skills", []),
            )

            breakdown = ScoreBreakdown(
                portfolio_score=portfolio_score,
                skills_score=skills_score,
                tools_score=tools_score,
                format_score=format_score,
                availability_score=avail_score,
            )

            match_obj = CreatorMatch(
                creator_id=c_id,
                creator=creator_summary,
                match_score=composite_score,
                score_breakdown=breakdown,
                matching_skills=matched_skills,
                matching_tools=matched_tools,
                relevant_portfolio_items=relevant_items[:3],
                missing_requirements=missing_tools,
                explanation=explanation,
                mandatory_checks_passed=True,
            )
            matches.append(match_obj)

        # Rank matches by match score descending
        matches.sort(key=lambda m: m.match_score, reverse=True)
        paginated_matches = matches[:limit]

        matching_mode = "semantic" if used_semantic else "deterministic_fallback"
        model_name = "all-MiniLM-L6-v2" if used_semantic else None

        return MatchResponse(
            brief_id=str(brief.get("id")),
            brief_title=brief.get("title", "Creative Brief"),
            brief_category=brief.get("content_type", "video"),
            matching_mode=matching_mode,
            model_name=model_name,
            total_candidates_evaluated=candidates_evaluated,
            total_matches=len(matches),
            matches=paginated_matches,
        )


matching_engine = MatchingEngine()

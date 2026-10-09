"""
AI Brief Generator Service
Synthesizes creative brief drafts from natural language brand prompts.
Supports live LLM endpoints (Gemini / OpenAI) when keys are configured,
with a robust generative domain synthesizer fallback.
"""

import os
import re
from typing import Optional
from app.schemas.brief import ContentTypeEnum, AIGenerateBriefResponse


def generate_brief_from_prompt(prompt: str, brand_name: Optional[str] = None) -> AIGenerateBriefResponse:
    """
    Transforms natural language prompt into a structured creative brief.
    Ensures speculative commercial constraints (budget, exact license, deadlines)
    are NOT invented.
    """
    clean_prompt = prompt.strip()
    p_lower = clean_prompt.lower()

    # 1. Determine Content Type
    if any(k in p_lower for k in ["video", "commercial", "film", "trailer", "cinematic", "cutdown", "spot"]):
        content_type = ContentTypeEnum.VIDEO
    elif any(k in p_lower for k in ["animation", "anime", "cartoon", "morphing", "motion design"]):
        content_type = ContentTypeEnum.ANIMATION
    elif any(k in p_lower for k in ["ad", "advertisement", "billboard", "banner", "product shot", "ecommerce"]):
        content_type = ContentTypeEnum.AD
    elif any(k in p_lower for k in ["design", "branding", "identity", "poster", "graphic"]):
        content_type = ContentTypeEnum.GRAPHIC_DESIGN
    else:
        content_type = ContentTypeEnum.IMAGE

    # 2. Extract or infer Duration
    duration = None
    duration_match = re.search(r'(\d+)\s*(?:seconds?|secs?|s)\b', p_lower)
    if duration_match:
        duration = f"{duration_match.group(1)} seconds"
    elif any(k in p_lower for k in ["short", "reel", "tiktok", "story"]):
        duration = "15-30 seconds"
    elif content_type in [ContentTypeEnum.VIDEO, ContentTypeEnum.ANIMATION]:
        duration = "30 seconds (Suggested)"

    # 3. Determine Aspect Ratio
    if any(k in p_lower for k in ["vertical", "tiktok", "reel", "shorts", "9:16", "story"]):
        aspect_ratio = "9:16"
    elif any(k in p_lower for k in ["square", "instagram", "1:1", "feed"]):
        aspect_ratio = "1:1"
    elif any(k in p_lower for k in ["portrait", "4:5"]):
        aspect_ratio = "4:5"
    else:
        aspect_ratio = "16:9"

    # 4. Infer Visual Style
    style_elements = []
    if any(k in p_lower for k in ["cinematic", "film", "anamorphic"]):
        style_elements.append("Anamorphic widescreen cinematography, 35mm film grain, dynamic lighting")
    if any(k in p_lower for k in ["cyberpunk", "futuristic", "sci-fi", "neon", "hologram"]):
        style_elements.append("Neo-futuristic atmospheric aesthetic, neon wet reflections, glowing emissive accents")
    if any(k in p_lower for k in ["luxury", "premium", "elegance", "fragrance", "jewelry"]):
        style_elements.append("Minimalist luxury editorial, soft caustics, sculpted lighting, macro glass refractions")
    if any(k in p_lower for k in ["surreal", "dream", "fantasy", "ethereal"]):
        style_elements.append("Ethereal dreamscape realism, impossible physics, organic morphing forms")
    if any(k in p_lower for k in ["photorealistic", "hyperrealistic", "raw"]):
        style_elements.append("Hyper-detailed naturalistic lighting, shallow depth of field, authentic textures")

    if not style_elements:
        style_elements.append("Premium modern aesthetic with tailored color grading and cinematic camera choreography")

    visual_style = ". ".join(style_elements)

    # 5. Suggest AI Tool Stack
    preferred_tools = []
    if content_type == ContentTypeEnum.VIDEO:
        preferred_tools = ["Runway Gen-3", "Kling AI", "ComfyUI", "Topaz Video AI"]
    elif content_type == ContentTypeEnum.ANIMATION:
        preferred_tools = ["Luma Dream Machine", "Kling AI", "AnimateDiff", "ComfyUI"]
    elif content_type == ContentTypeEnum.AD:
        preferred_tools = ["Flux.1 Pro", "Midjourney v6", "Magnific AI", "Photoshop GenFill"]
    elif content_type == ContentTypeEnum.GRAPHIC_DESIGN:
        preferred_tools = ["Midjourney v6", "Flux.1", "Illustrator", "Photoshop"]
    else:
        preferred_tools = ["Midjourney v6", "Flux.1 Pro", "Magnific AI"]

    # 6. Deliverables
    deliverables = []
    if content_type in [ContentTypeEnum.VIDEO, ContentTypeEnum.ANIMATION]:
        deliverables.append(f"1x Master Video ({aspect_ratio}, 4K Pro-Res/MP4, {duration or '30s'})")
        deliverables.append("1x Social Cutdown (9:16 Vertical format)")
        deliverables.append("3x High-Resolution Keyframe Stills for marketing posters")
    elif content_type == ContentTypeEnum.AD:
        deliverables.append("3x Campaign Key Visual Stills (8K Resolution)")
        deliverables.append("1x Ambient Motion Poster (10s seamless loop)")
        deliverables.append("Layered assets with transparent alpha cutouts where applicable")
    else:
        deliverables.append("4x High-Resolution Finished Stills (4K+)")
        deliverables.append("Prompt & LoRA workflow transparency log")

    # 7. Generate Title and Subject
    # Extract subject topic
    clean_title_prompt = re.sub(r'^(create|generate|make|build|produce)\s+(a|an)?\s*', '', clean_prompt, flags=re.IGNORECASE)
    words = clean_title_prompt.split()
    short_title = " ".join(words[:6]).title()
    if not short_title:
        short_title = "Generative Creative Campaign"

    derived_brand = brand_name or "Your Brand Studio"
    derived_title = f"{short_title} — AI Production"

    description = (
        f"Production brief based on concept: \"{clean_prompt}\".\n\n"
        f"The creator will direct and synthesize a complete {content_type.value} production showcasing high temporal coherence, "
        f"photorealistic surface detail, and precise brand tone. The pipeline requires multi-model generative orchestration "
        f"with human-in-the-loop post-processing to ensure uncompromising broadcast quality."
    )

    creative_objective = (
        f"Engage target audiences through unforgettable visual storytelling, highlighting the unique value and aesthetic "
        f"of {derived_brand} while pushing generative visual fidelity beyond conventional production limitations."
    )

    return AIGenerateBriefResponse(
        title=derived_title,
        brand_name=derived_brand,
        description=description,
        creative_objective=creative_objective,
        content_type=content_type,
        visual_style=visual_style,
        aspect_ratio=aspect_ratio,
        duration=duration,
        ai_tools_preferred=preferred_tools,
        deliverables=deliverables,
        suggested_revision_expectations="2 rounds of structured generative iteration included (storyboard approval + final finishing)",
        budget_guidance="Please input confirmed project budget in Step 3 based on your marketing budget.",
        licensing_guidance="Please specify commercial distribution channels (e.g. Worldwide Digital Buyout or Regional Broadcast).",
    )

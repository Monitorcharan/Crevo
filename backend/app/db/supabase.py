import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("crevo.db")

# Initialize real Supabase client if configured
supabase_client: Optional[Client] = None

if settings.is_supabase_configured:
    try:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        supabase_client = create_client(settings.SUPABASE_URL, key)
        logger.info("Connected to remote Supabase instance at %s", settings.SUPABASE_URL)
    except Exception as e:
        logger.warning("Could not initialize remote Supabase client: %s. Operating in Demo Seed mode.", e)
else:
    logger.info("Supabase credentials not detected in environment. Operating in Demo Seed repository mode.")


# =========================================================================
# In-Memory Seed Dataset (Fall-back for standalone dev & automated testing)
# =========================================================================
DEMO_CREATORS_SEED: List[Dict[str, Any]] = [
    {
        "id": "elena-vance",
        "user_id": "00000000-0000-0000-0000-000000000001",
        "display_name": "Elena Vance",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "cover_url": "/creators/cyber_city.jpg",
        "headline": "Senior AI Filmmaker & Narrative Director",
        "specialization": "AI Filmmaking",
        "bio": "Directs cinematic narrative films and sci-fi shorts using multi-model generative pipelines with precise character consistency, camera pacing, and custom LoRA workflows.",
        "skills": ["Cinematic Direction", "Character Consistency", "Motion Prompting", "Sound Design", "Color Grading"],
        "ai_tools": ["Runway Gen-3", "Midjourney v6", "Kling AI", "ComfyUI", "ElevenLabs"],
        "availability": "Available Now",
        "location": "Berlin, Germany",
        "rating": 4.98,
        "reviews_count": 38,
        "projects_count": 42,
        "starting_price": 2400,
        "price_unit": "project",
        "verification": {
            "isDemo": True,
            "badgeLabel": "Demo Verified Creator",
            "identityStatus": "Government ID & Biometric Match Verified",
            "portfolioStatus": "Original Project Files & Seed Logs Inspected",
            "toolProficiency": "Mastery Demonstrated in Runway Gen-3 & ComfyUI",
            "completedProjects": 42,
            "inspectionDate": "October 2026",
            "note": "Demo data representing Crevo Trust & Safety verification protocol.",
        },
        "portfolio_items": [
            {
                "id": "item-elena-1",
                "creator_id": "00000000-0000-0000-0000-000000000001",
                "title": "Nebula Prime: First Contact",
                "description": "An atmospheric sci-fi film still capturing an astronaut encountering a sentient cosmic nebula. Synthesized using multi-prompt camera tracking.",
                "media_url": "/creators/film_sci_fi.jpg",
                "media_type": "video",
                "tools_used": ["Runway Gen-3 Alpha", "Midjourney v6", "ComfyUI Character LoRA"],
                "workflow_description": "Initial concept turnaround sheets in Midjourney v6. Generated 14 distinct motion sequences in Runway Gen-3.",
                "commercial_use_status": "cleared",
                "created_at": datetime(2026, 10, 1).isoformat(),
            },
            {
                "id": "item-elena-2",
                "creator_id": "00000000-0000-0000-0000-000000000001",
                "title": "Lost Orbit: Deep Space Capsule",
                "description": "Speculative astronaut textile exploration investigating zero-gravity chrome drapery and cosmic atmospheric refraction.",
                "media_url": "/creators/digital_fashion.jpg",
                "media_type": "image",
                "tools_used": ["Midjourney v6", "ComfyUI Experimental Graph"],
                "workflow_description": "Exploratory generative sketch series developed for personal cinematic research into speculative spacesuit textiles.",
                "commercial_use_status": "not_cleared",
                "created_at": datetime(2026, 10, 2).isoformat(),
            },
        ],
    },
    {
        "id": "marcus-sterling",
        "user_id": "00000000-0000-0000-0000-000000000002",
        "display_name": "Marcus Sterling",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "cover_url": "/creators/luxury_car.jpg",
        "headline": "Automotive & Commercial Visuals Director",
        "specialization": "Product Ads",
        "bio": "Pioneers hyperrealistic automotive commercials, kinetic luxury product spots, and cinematic motion graphics for performance brands.",
        "skills": ["Product Cinematography", "Automotive Lighting", "Motion Graphics", "3D Scene Matching"],
        "ai_tools": ["Runway Gen-3", "Midjourney v6", "Stable Diffusion", "Unreal Engine", "ComfyUI"],
        "availability": "Available Now",
        "location": "London, UK",
        "rating": 5.0,
        "reviews_count": 52,
        "projects_count": 56,
        "starting_price": 3200,
        "price_unit": "campaign",
        "verification": {
            "isDemo": True,
            "badgeLabel": "Demo Verified Director",
            "identityStatus": "UK Studio Incorporation & ID Verified",
            "portfolioStatus": "Commercial Agency Client Invoices & Source Files Confirmed",
            "toolProficiency": "Certified Pipeline in Unreal Engine 5 & Runway Gen-3",
            "completedProjects": 56,
            "inspectionDate": "September 2026",
            "note": "Demo data representing Crevo Trust & Safety verification protocol.",
        },
        "portfolio_items": [
            {
                "id": "item-marcus-1",
                "creator_id": "00000000-0000-0000-0000-000000000002",
                "title": "Ioniq Nebula: Electric Velocity",
                "description": "Kinetic wet-track driving sequence featuring titanium reflections and aerodynamic light paths.",
                "media_url": "/creators/luxury_car.jpg",
                "media_type": "ad",
                "tools_used": ["Runway Gen-3", "Unreal Engine 5", "ComfyUI Depth ControlNet"],
                "workflow_description": "Track camera path modeled in Unreal Engine 5, fed into ComfyUI diffusion pipeline for photorealistic titanium materials.",
                "commercial_use_status": "cleared",
                "created_at": datetime(2026, 9, 20).isoformat(),
            }
        ],
    },
    {
        "id": "sophia-chen",
        "user_id": "00000000-0000-0000-0000-000000000003",
        "display_name": "Sophia Chen",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        "cover_url": "/creators/animation_forest.jpg",
        "headline": "Lead AI 3D Animator & Worldbuilder",
        "specialization": "Animation",
        "bio": "Specializes in whimsical, ethereal animation and fantastical bioluminescent worldbuilding blending Shinkai aesthetics with diffusion motion.",
        "skills": ["Fantasy Animation", "Worldbuilding", "Bioluminescent Shading", "Particle Synthesis"],
        "ai_tools": ["Kling AI", "Midjourney v6", "Luma Dream Machine", "Blender", "ComfyUI"],
        "availability": "Booking Next Month",
        "location": "Tokyo, Japan",
        "rating": 4.95,
        "reviews_count": 29,
        "projects_count": 34,
        "starting_price": 1800,
        "price_unit": "sequence",
        "verification": {
            "isDemo": True,
            "badgeLabel": "Demo Verified Animator",
            "identityStatus": "Identity & Professional Credentials Verified",
            "portfolioStatus": "Blender & Kling Model Source Projects Validated",
            "toolProficiency": "Proficiency Confirmed in Kling AI, Luma & Deforum",
            "completedProjects": 34,
            "inspectionDate": "October 2026",
            "note": "Demo data representing Crevo Trust & Safety verification protocol.",
        },
        "portfolio_items": [],
    },
]


class DatabaseRepository:
    """
    Data abstraction layer supporting both live Supabase PostgreSQL
    and local in-memory seed records.
    """

    def __init__(self, client: Optional[Client] = None):
        self.client = client
        # In-memory store for local testing
        self._creators: List[Dict[str, Any]] = [dict(c) for c in DEMO_CREATORS_SEED]
        self._profiles: Dict[str, Dict[str, Any]] = {}

    @property
    def is_live(self) -> bool:
        return self.client is not None

    # -------------------------------------------------------------------------
    # Creator Profiles
    # -------------------------------------------------------------------------
    async def get_creators(
        self,
        search: Optional[str] = None,
        specialization: Optional[str] = None,
        ai_tool: Optional[str] = None,
        availability: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        if self.is_live:
            try:
                query = self.client.table("creator_profiles").select("*, profiles(*), portfolio_items(*)")
                if specialization and specialization != "All":
                    query = query.eq("specialization", specialization)
                if availability and availability != "All":
                    query = query.eq("availability", availability)
                if ai_tool and ai_tool != "All":
                    query = query.contains("ai_tools", [ai_tool])

                response = query.range(offset, offset + limit - 1).execute()
                items = response.data or []
                total = len(items)
                return {"items": items, "total": total, "limit": limit, "offset": offset}
            except Exception as e:
                logger.error("Supabase query failed, falling back to seed repository: %s", e)

        # In-memory search / filter fallback
        results = [c for c in self._creators]

        if search and search.strip():
            q = search.lower().strip()
            results = [
                c for c in results
                if q in c["display_name"].lower()
                or q in c.get("headline", "").lower()
                or q in c.get("bio", "").lower()
                or any(q in s.lower() for s in c.get("skills", []))
                or any(q in t.lower() for t in c.get("ai_tools", []))
            ]

        if specialization and specialization != "All":
            results = [c for c in results if c.get("specialization") == specialization]

        if ai_tool and ai_tool != "All":
            results = [c for c in results if ai_tool in c.get("ai_tools", [])]

        if availability and availability != "All":
            results = [c for c in results if c.get("availability") == availability]

        total = len(results)
        paginated = results[offset : offset + limit]

        return {"items": paginated, "total": total, "limit": limit, "offset": offset}

    async def get_creator_by_id(self, creator_id: str) -> Optional[Dict[str, Any]]:
        if self.is_live:
            try:
                response = (
                    self.client.table("creator_profiles")
                    .select("*, profiles(*), portfolio_items(*)")
                    .or_(f"user_id.eq.{creator_id},id.eq.{creator_id}")
                    .single()
                    .execute()
                )
                if response.data:
                    return response.data
            except Exception as e:
                logger.debug("Live fetch error: %s", e)

        # Check in-memory by slug or user_id
        for c in self._creators:
            if c["id"] == creator_id or c.get("user_id") == creator_id:
                return c
        return None

    async def update_creator_profile(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        clean_data = {k: v for k, v in update_data.items() if v is not None}

        if self.is_live:
            try:
                # Update profiles table if display_name / avatar_url are present
                profile_updates = {}
                if "display_name" in clean_data:
                    profile_updates["display_name"] = clean_data.pop("display_name")
                if "avatar_url" in clean_data:
                    profile_updates["avatar_url"] = clean_data.pop("avatar_url")

                if profile_updates:
                    self.client.table("profiles").update(profile_updates).eq("id", user_id).execute()

                if clean_data:
                    res = self.client.table("creator_profiles").update(clean_data).eq("user_id", user_id).execute()
                    if res.data:
                        return await self.get_creator_by_id(user_id)
            except Exception as e:
                logger.error("Supabase update error: %s", e)

        # In-memory update
        creator = await self.get_creator_by_id(user_id)
        if creator:
            for k, v in clean_data.items():
                creator[k] = v
            return creator

        # If not found, create new record
        new_creator = {
            "id": user_id,
            "user_id": user_id,
            "display_name": clean_data.get("display_name", "AI Creator"),
            "avatar_url": clean_data.get("avatar_url"),
            "headline": clean_data.get("headline", "Generative Director"),
            "bio": clean_data.get("bio", ""),
            "specialization": clean_data.get("specialization", "AI Art"),
            "skills": clean_data.get("skills", []),
            "ai_tools": clean_data.get("ai_tools", []),
            "availability": clean_data.get("availability", "Available Now"),
            "cover_url": clean_data.get("cover_url", "/creators/cyber_city.jpg"),
            "rating": 5.0,
            "reviews_count": 0,
            "projects_count": 0,
            "starting_price": 1500,
            "price_unit": "project",
            "portfolio_items": [],
        }
        self._creators.append(new_creator)
        return new_creator

    # -------------------------------------------------------------------------
    # Portfolio Items
    # -------------------------------------------------------------------------
    async def get_creator_portfolio(self, creator_id: str) -> List[Dict[str, Any]]:
        creator = await self.get_creator_by_id(creator_id)
        if not creator:
            return []
        return creator.get("portfolio_items", [])

    async def create_portfolio_item(self, creator_id: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
        item_id = str(uuid.uuid4())
        created_item = {
            "id": item_id,
            "creator_id": creator_id,
            "created_at": datetime.utcnow().isoformat(),
            **item_data,
        }

        if self.is_live:
            try:
                res = self.client.table("portfolio_items").insert(created_item).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error("Supabase insert error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        if creator:
            if "portfolio_items" not in creator:
                creator["portfolio_items"] = []
            creator["portfolio_items"].append(created_item)
            return created_item

        return created_item

    async def update_portfolio_item(
        self, item_id: str, creator_id: str, update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        clean_data = {k: v for k, v in update_data.items() if v is not None}

        if self.is_live:
            try:
                res = (
                    self.client.table("portfolio_items")
                    .update(clean_data)
                    .eq("id", item_id)
                    .eq("creator_id", creator_id)
                    .execute()
                )
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error("Supabase update error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        if creator:
            for item in creator.get("portfolio_items", []):
                if item["id"] == item_id:
                    for k, v in clean_data.items():
                        item[k] = v
                    return item
        return None

    async def delete_portfolio_item(self, item_id: str, creator_id: str) -> bool:
        if self.is_live:
            try:
                self.client.table("portfolio_items").delete().eq("id", item_id).eq("creator_id", creator_id).execute()
                return True
            except Exception as e:
                logger.error("Supabase delete error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        if creator:
            before_len = len(creator.get("portfolio_items", []))
            creator["portfolio_items"] = [i for i in creator.get("portfolio_items", []) if i["id"] != item_id]
            return len(creator["portfolio_items"]) < before_len
        return False


# Singleton instance
repo = DatabaseRepository(supabase_client)

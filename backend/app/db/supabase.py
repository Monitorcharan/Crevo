import logging
import uuid
from datetime import datetime, date
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
        "ai_tools": ["Runway Gen-3", "Midjourney v6", "Stable Diffusion", "Unreal Engine", "ComfyUI", "Flux.1"],
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
            },
            {
                "id": "item-marcus-2",
                "creator_id": "00000000-0000-0000-0000-000000000002",
                "title": "Ethereal Essence: Luxury Fragrance Campaign",
                "description": "Commercial still campaign for a luxury fragrance brand showcasing sculpted glass flacons.",
                "media_url": "/creators/perfume_ad.jpg",
                "media_type": "ad",
                "tools_used": ["Flux.1 Pro", "Midjourney v6", "Magnific AI"],
                "workflow_description": "Synthesized with Flux.1 Pro utilizing controlled glass caustics lighting prompts.",
                "commercial_use_status": "cleared",
                "created_at": datetime(2026, 9, 25).isoformat(),
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
        "portfolio_items": [
            {
                "id": "item-sophia-1",
                "creator_id": "00000000-0000-0000-0000-000000000003",
                "title": "Neon Shinjuku: Android Awakening",
                "description": "Cyberpunk narrative sequence following a cybernetic street samurai navigating holographic rain-slicked alleyways.",
                "media_url": "/creators/character_cyber.jpg",
                "media_type": "animation",
                "tools_used": ["Kling AI 1.5", "ComfyUI AnimateDiff", "Topaz Video AI"],
                "workflow_description": "Choreographed using AnimateDiff motion modules in ComfyUI with high temporal coherence.",
                "commercial_use_status": "cleared",
                "created_at": datetime(2026, 10, 5).isoformat(),
            }
        ],
    },
]

DEMO_BRIEFS_SEED: List[Dict[str, Any]] = [
    {
        "id": "20000000-0000-0000-0000-000000000001",
        "owner_id": "00000000-0000-0000-0000-000000000010",
        "title": "Hyperion Apex: Autonomous Electric Scooter Launch Film",
        "brand_name": "Hyperion Mobility",
        "description": "Create a high-octane 30-second cinematic launch commercial showcasing the Hyperion Apex electric scooter gliding through a rainy neo-cyberpunk metropolis with neon puddle reflections and dynamic camera swoops.",
        "creative_objective": "Drive pre-orders among urban tech professionals and position Hyperion as the premium apex of personal electric transit.",
        "content_type": "video",
        "visual_style": "Neo-noir cyberpunk, high-contrast anamorphic lens flares, rain-slicked asphalt, vibrant violet and teal reflections.",
        "aspect_ratio": "16:9",
        "duration": "30 seconds",
        "ai_tools_preferred": ["Runway Gen-3", "Kling AI", "Midjourney v6", "Topaz Video AI"],
        "deliverables": ["1x 30s 4K Master Video (16:9)", "1x 15s Cutdown for Social (9:16)", "5x Key Visual Stills (4K)"],
        "budget_min": 3500,
        "budget_max": 6000,
        "currency": "USD",
        "deadline": "2026-10-30",
        "commercial_use_requirements": "Full commercial buyout with worldwide digital and broadcast rights across web, social, and CTV.",
        "licensing_expectations": "Perpetual exclusive commercial license for all generated deliverables and final cut.",
        "revision_expectations": "3 rounds of storyboard & generative prompt revisions included.",
        "status": "published",
        "created_at": "2026-10-09T09:42:29Z",
        "updated_at": "2026-10-09T09:42:29Z",
    },
    {
        "id": "20000000-0000-0000-0000-000000000002",
        "owner_id": "00000000-0000-0000-0000-000000000010",
        "title": "Aura Botanica: Bioluminescent Fragrance Campaign",
        "brand_name": "Maison de L'Ombre",
        "description": "Develop an ethereal advertising campaign featuring crystalline perfume flacons intertwined with luminous deep-jungle flora and bioluminescent dew droplets.",
        "creative_objective": "Convey organic luxury and botanical mystique for luxury retail displays and global social rollouts.",
        "content_type": "ad",
        "visual_style": "Luminous macro realism, dark emerald and soft amber caustics, soft atmospheric bloom, hyper-detailed glass refractions.",
        "aspect_ratio": "4:5",
        "duration": None,
        "ai_tools_preferred": ["Flux.1 Pro", "Midjourney v6", "Magnific AI", "Photoshop GenFill"],
        "deliverables": ["3x High-Res Campaign Stills (8K print-ready)", "1x 10s Seamless Looping Ambient Motion Poster"],
        "budget_min": 2000,
        "budget_max": 4000,
        "currency": "USD",
        "deadline": "2026-10-23",
        "commercial_use_requirements": "Global commercial advertising and print catalog rights.",
        "licensing_expectations": "Perpetual non-exclusive worldwide rights.",
        "revision_expectations": "2 rounds of revisions.",
        "status": "published",
        "created_at": "2026-10-09T09:42:29Z",
        "updated_at": "2026-10-09T09:42:29Z",
    },
]

DEMO_APPLICATIONS_SEED: List[Dict[str, Any]] = [
    {
        "id": "30000000-0000-0000-0000-000000000001",
        "brief_id": "20000000-0000-0000-0000-000000000001",
        "creator_id": "00000000-0000-0000-0000-000000000001",
        "proposal": "I specialize in cinematic narrative sci-fi directing using Runway Gen-3 and Kling AI. I can deliver multi-angle camera tracking and pristine character consistency for the Hyperion Apex sequence with custom sound design.",
        "proposed_rate": 4800,
        "portfolio_item_ids": ["10000000-0000-0000-0000-000000000001"],
        "status": "shortlisted",
        "created_at": "2026-10-09T09:42:29Z",
        "updated_at": "2026-10-09T09:42:29Z",
    },
    {
        "id": "30000000-0000-0000-0000-000000000002",
        "brief_id": "20000000-0000-0000-0000-000000000002",
        "creator_id": "00000000-0000-0000-0000-000000000002",
        "proposal": "I have proven experience in high-end luxury cosmetic staging using Flux.1 and Magnific upscaling. Please see my Ethereal Essence campaign in my portfolio for direct proof of glass caustic realism.",
        "proposed_rate": 2800,
        "portfolio_item_ids": ["10000000-0000-0000-0000-000000000003"],
        "status": "pending",
        "created_at": "2026-10-09T09:42:29Z",
        "updated_at": "2026-10-09T09:42:29Z",
    },
]


class DatabaseRepository:
    """
    Data abstraction layer supporting both live Supabase PostgreSQL
    and local in-memory seed records.
    """

    def __init__(self, client: Optional[Client] = None):
        self.client = client
        self._creators: List[Dict[str, Any]] = [dict(c) for c in DEMO_CREATORS_SEED]
        self._profiles: Dict[str, Dict[str, Any]] = {
            "00000000-0000-0000-0000-000000000001": {"id": "00000000-0000-0000-0000-000000000001", "role": "creator", "display_name": "Elena Vance"},
            "00000000-0000-0000-0000-000000000002": {"id": "00000000-0000-0000-0000-000000000002", "role": "creator", "display_name": "Marcus Sterling"},
            "00000000-0000-0000-0000-000000000003": {"id": "00000000-0000-0000-0000-000000000003", "role": "creator", "display_name": "Sophia Chen"},
            "00000000-0000-0000-0000-000000000010": {"id": "00000000-0000-0000-0000-000000000010", "role": "brand", "display_name": "Lumina Creative Studio"},
        }
        self._briefs: List[Dict[str, Any]] = [dict(b) for b in DEMO_BRIEFS_SEED]
        self._applications: List[Dict[str, Any]] = [dict(a) for a in DEMO_APPLICATIONS_SEED]

    @property
    def is_live(self) -> bool:
        return self.client is not None

    # -------------------------------------------------------------------------
    # Creator Profiles
    # -------------------------------------------------------------------------
    def _flatten_creator(self, item: Dict[str, Any]) -> Dict[str, Any]:
        c = dict(item)
        profile = c.pop("profiles", None)
        if isinstance(profile, dict):
            c["id"] = profile.get("id") or c.get("user_id")
            c["display_name"] = profile.get("display_name") or "AI Creator"
            c["avatar_url"] = profile.get("avatar_url") or c.get("avatar_url")
        elif "id" not in c and "user_id" in c:
            c["id"] = c["user_id"]
            c["display_name"] = c.get("display_name") or "AI Creator"
        return c

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
                query = self.client.table("creator_profiles").select("*, profiles(*)")
                if specialization and specialization != "All":
                    query = query.eq("specialization", specialization)
                if availability and availability != "All":
                    query = query.eq("availability", availability)
                if ai_tool and ai_tool != "All":
                    query = query.contains("ai_tools", [ai_tool])

                response = query.range(offset, offset + limit - 1).execute()
                items = [self._flatten_creator(item) for item in (response.data or [])]
                for item in items:
                    p_res = self.client.table("portfolio_items").select("*").eq("creator_id", item.get("user_id")).execute()
                    item["portfolio_items"] = p_res.data or []
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
                res = self.client.table("creator_profiles").select("*, profiles(*)").eq("user_id", creator_id).execute()
                if res.data:
                    c = self._flatten_creator(res.data[0])
                    p_res = self.client.table("portfolio_items").select("*").eq("creator_id", c.get("user_id")).execute()
                    c["portfolio_items"] = p_res.data or []
                    return c
            except Exception as e:
                logger.error("Supabase creator lookup failed: %s", e)

        for c in self._creators:
            if c["id"] == creator_id or c["user_id"] == creator_id:
                return c
        return None

    async def update_creator_profile(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        clean_data = {k: v for k, v in update_data.items() if v is not None}
        if self.is_live:
            try:
                res = self.client.table("creator_profiles").update(clean_data).eq("user_id", user_id).execute()
                if res.data:
                    return await self.get_creator_by_id(user_id)
            except Exception as e:
                logger.error("Supabase update creator failed: %s", e)

        creator = await self.get_creator_by_id(user_id)
        if creator:
            for k, v in clean_data.items():
                creator[k] = v
            return creator
        return None


    # -------------------------------------------------------------------------
    # Portfolio Items
    # -------------------------------------------------------------------------
    async def get_creator_portfolio(self, creator_id: str) -> List[Dict[str, Any]]:
        if self.is_live:
            try:
                res = self.client.table("portfolio_items").select("*").eq("creator_id", creator_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error("Supabase get portfolio error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        if not creator:
            return []
        return creator.get("portfolio_items", [])

    async def get_all_portfolios(self) -> List[Dict[str, Any]]:
        if self.is_live:
            try:
                res = self.client.table("portfolio_items").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error("Supabase get all portfolios error: %s", e)

        all_p = []
        for c in self._creators:
            all_p.extend(c.get("portfolio_items", []))
        return all_p

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
                logger.error("Supabase insert portfolio error: %s", e)

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
                logger.error("Supabase update portfolio error: %s", e)

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
                logger.error("Supabase delete portfolio error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        if creator:
            before_len = len(creator.get("portfolio_items", []))
            creator["portfolio_items"] = [i for i in creator.get("portfolio_items", []) if i["id"] != item_id]
            return len(creator["portfolio_items"]) < before_len
        return False

    # -------------------------------------------------------------------------
    # Creative Briefs
    # -------------------------------------------------------------------------
    async def list_briefs(
        self,
        status: Optional[str] = None,
        owner_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        if self.is_live:
            try:
                query = self.client.table("briefs").select("*, brief_applications(count)")
                if status and status != "All":
                    query = query.eq("status", status)
                if owner_id:
                    query = query.eq("owner_id", owner_id)
                res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
                raw_items = res.data or []
                for item in raw_items:
                    # flatten count
                    counts = item.get("brief_applications", [])
                    item["applications_count"] = counts[0]["count"] if counts and isinstance(counts, list) and "count" in counts[0] else len(counts)
                total = len(raw_items)
                return {"items": raw_items, "total": total, "limit": limit, "offset": offset}
            except Exception as e:
                logger.error("Supabase list briefs error: %s", e)

        results = [dict(b) for b in self._briefs]
        if status and status != "All":
            results = [b for b in results if b.get("status") == status]
        if owner_id:
            results = [b for b in results if b.get("owner_id") == owner_id]
        if search and search.strip():
            q = search.lower().strip()
            results = [
                b for b in results
                if q in b.get("title", "").lower()
                or q in b.get("description", "").lower()
                or q in b.get("brand_name", "").lower()
            ]

        # Attach application counts
        for b in results:
            b["applications_count"] = sum(1 for a in self._applications if a["brief_id"] == b["id"])

        total = len(results)
        paginated = results[offset : offset + limit]
        return {"items": paginated, "total": total, "limit": limit, "offset": offset}

    async def get_brief_by_id(self, brief_id: str) -> Optional[Dict[str, Any]]:
        if self.is_live:
            try:
                res = self.client.table("briefs").select("*, brief_applications(count)").eq("id", brief_id).execute()
                if res.data:
                    item = res.data[0]
                    counts = item.get("brief_applications", [])
                    item["applications_count"] = counts[0]["count"] if counts and isinstance(counts, list) and "count" in counts[0] else len(counts)
                    return item
            except Exception as e:
                logger.error("Supabase get brief error: %s", e)

        for b in self._briefs:
            if b["id"] == brief_id:
                b_copy = dict(b)
                b_copy["applications_count"] = sum(1 for a in self._applications if a["brief_id"] == b["id"])
                return b_copy
        return None

    async def create_brief(self, owner_id: str, brief_data: Dict[str, Any]) -> Dict[str, Any]:
        brief_id = str(uuid.uuid4())
        created_brief = {
            "id": brief_id,
            "owner_id": owner_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            **brief_data,
        }

        # Convert date to string if needed
        if isinstance(created_brief.get("deadline"), (date, datetime)):
            created_brief["deadline"] = created_brief["deadline"].isoformat()

        if self.is_live:
            try:
                res = self.client.table("briefs").insert(created_brief).execute()
                if res.data:
                    item = res.data[0]
                    item["applications_count"] = 0
                    return item
            except Exception as e:
                logger.error("Supabase insert brief error: %s", e)

        created_brief["applications_count"] = 0
        self._briefs.append(created_brief)
        return created_brief

    async def update_brief(self, brief_id: str, owner_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        clean_data = {k: v for k, v in update_data.items() if v is not None}
        clean_data["updated_at"] = datetime.utcnow().isoformat()
        if isinstance(clean_data.get("deadline"), (date, datetime)):
            clean_data["deadline"] = clean_data["deadline"].isoformat()

        if self.is_live:
            try:
                res = self.client.table("briefs").update(clean_data).eq("id", brief_id).eq("owner_id", owner_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error("Supabase update brief error: %s", e)

        for b in self._briefs:
            if b["id"] == brief_id and b["owner_id"] == owner_id:
                for k, v in clean_data.items():
                    b[k] = v
                return b
        return None

    async def delete_brief(self, brief_id: str, owner_id: str) -> bool:
        if self.is_live:
            try:
                self.client.table("briefs").delete().eq("id", brief_id).eq("owner_id", owner_id).execute()
                return True
            except Exception as e:
                logger.error("Supabase delete brief error: %s", e)

        before_len = len(self._briefs)
        self._briefs = [b for b in self._briefs if not (b["id"] == brief_id and b["owner_id"] == owner_id)]
        return len(self._briefs) < before_len

    # -------------------------------------------------------------------------
    # Brief Applications
    # -------------------------------------------------------------------------
    async def list_brief_applications(
        self,
        brief_id: Optional[str] = None,
        creator_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if self.is_live:
            try:
                query = self.client.table("brief_applications").select("*, profiles(*)")
                if brief_id:
                    query = query.eq("brief_id", brief_id)
                if creator_id:
                    query = query.eq("creator_id", creator_id)
                res = query.order("created_at", desc=True).execute()
                raw_items = res.data or []
                enriched = []
                for a in raw_items:
                    creator = await self.get_creator_by_id(a["creator_id"])
                    a["creator"] = {
                        "id": a["creator_id"],
                        "display_name": creator.get("display_name", "Creator") if creator else a.get("profiles", {}).get("display_name", "Creator"),
                        "avatar_url": creator.get("avatar_url") if creator else a.get("profiles", {}).get("avatar_url"),
                        "headline": creator.get("headline") if creator else None,
                        "specialization": creator.get("specialization") if creator else None,
                        "rating": creator.get("rating", 5.0) if creator else 5.0,
                        "starting_price": creator.get("starting_price") if creator else None,
                        "ai_tools": creator.get("ai_tools", []) if creator else [],
                    }
                    enriched.append(a)
                return enriched
            except Exception as e:
                logger.error("Supabase list applications error: %s", e)

        results = [a for a in self._applications]
        if brief_id:
            results = [a for a in results if a["brief_id"] == brief_id]
        if creator_id:
            results = [a for a in results if a["creator_id"] == creator_id]

        enriched = []
        for a in results:
            a_copy = dict(a)
            creator = await self.get_creator_by_id(a_copy["creator_id"])
            a_copy["creator"] = {
                "id": a_copy["creator_id"],
                "display_name": creator.get("display_name", "Creator") if creator else "Creator",
                "avatar_url": creator.get("avatar_url") if creator else None,
                "headline": creator.get("headline") if creator else None,
                "specialization": creator.get("specialization") if creator else None,
                "rating": creator.get("rating", 5.0) if creator else 5.0,
                "starting_price": creator.get("starting_price") if creator else None,
                "ai_tools": creator.get("ai_tools", []) if creator else [],
            }
            enriched.append(a_copy)
        return enriched

    async def get_application_by_id(self, app_id: str) -> Optional[Dict[str, Any]]:
        if self.is_live:
            try:
                res = self.client.table("brief_applications").select("*").eq("id", app_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error("Supabase get application error: %s", e)

        for a in self._applications:
            if a["id"] == app_id:
                return a
        return None

    async def create_application(self, brief_id: str, creator_id: str, app_data: Dict[str, Any]) -> Dict[str, Any]:
        app_id = str(uuid.uuid4())
        created_app = {
            "id": app_id,
            "brief_id": brief_id,
            "creator_id": creator_id,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            **app_data,
        }

        if self.is_live:
            try:
                res = self.client.table("brief_applications").insert(created_app).execute()
                if res.data:
                    item = res.data[0]
                    creator = await self.get_creator_by_id(creator_id)
                    item["creator"] = {
                        "id": creator_id,
                        "display_name": creator.get("display_name", "Creator") if creator else "Creator",
                        "avatar_url": creator.get("avatar_url") if creator else None,
                        "headline": creator.get("headline") if creator else None,
                        "specialization": creator.get("specialization") if creator else None,
                    }
                    return item
            except Exception as e:
                logger.error("Supabase insert application error: %s", e)

        creator = await self.get_creator_by_id(creator_id)
        created_app["creator"] = {
            "id": creator_id,
            "display_name": creator.get("display_name", "Creator") if creator else "Creator",
            "avatar_url": creator.get("avatar_url") if creator else None,
            "headline": creator.get("headline") if creator else None,
            "specialization": creator.get("specialization") if creator else None,
        }
        self._applications.append(created_app)
        return created_app

    async def update_application_status(self, app_id: str, status: str) -> Optional[Dict[str, Any]]:
        if self.is_live:
            try:
                res = self.client.table("brief_applications").update({"status": status, "updated_at": datetime.utcnow().isoformat()}).eq("id", app_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error("Supabase update application status error: %s", e)

        for a in self._applications:
            if a["id"] == app_id:
                a["status"] = status
                a["updated_at"] = datetime.utcnow().isoformat()
                return a
        return None


# Singleton instance
repo = DatabaseRepository(supabase_client)

-- ============================================================================
-- Crevo AI Creator Marketplace — Supabase Demo Seed Data
-- Version: 002_seed_demo_data.sql
-- Description: Seed initial demo creators and portfolio items for demonstration.
-- Explicitly labeled as demo seed data (is_demo_seed = TRUE).
-- ============================================================================

-- Ensure pgcrypto is enabled for passwords
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert Demo Users into auth.users (if not already existing) so profiles foreign key succeeds
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'elena.vance@crevo.demo',
    crypt('demo1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Elena Vance","role":"creator"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'marcus.sterling@crevo.demo',
    crypt('demo1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Marcus Sterling","role":"creator"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'sophia.chen@crevo.demo',
    crypt('demo1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Sophia Chen","role":"creator"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 1. Elena Vance
INSERT INTO public.profiles (id, role, display_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'creator',
    'Elena Vance',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.creator_profiles (
    user_id, headline, bio, specialization, skills, ai_tools, availability, cover_url, starting_price, is_demo_seed
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Senior AI Filmmaker & Narrative Director',
    'Directs cinematic narrative films and sci-fi shorts using multi-model generative pipelines with precise character consistency, camera pacing, and custom LoRA workflows.',
    'AI Filmmaking',
    ARRAY['Cinematic Direction', 'Character Consistency', 'Motion Prompting', 'Sound Design', 'Color Grading'],
    ARRAY['Runway Gen-3', 'Midjourney v6', 'Kling AI', 'ComfyUI', 'ElevenLabs'],
    'Available Now',
    '/creators/cyber_city.jpg',
    2400,
    TRUE
) ON CONFLICT (user_id) DO UPDATE SET
    headline = EXCLUDED.headline,
    bio = EXCLUDED.bio,
    specialization = EXCLUDED.specialization,
    skills = EXCLUDED.skills,
    ai_tools = EXCLUDED.ai_tools,
    availability = EXCLUDED.availability,
    cover_url = EXCLUDED.cover_url;

INSERT INTO public.portfolio_items (
    id, creator_id, title, description, media_url, media_type, tools_used, workflow_description, commercial_use_status
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Nebula Prime: First Contact',
    'An atmospheric sci-fi film still capturing an astronaut encountering a sentient cosmic nebula. Synthesized using multi-prompt camera tracking with anamorphic lighting.',
    '/creators/film_sci_fi.jpg',
    'video',
    ARRAY['Runway Gen-3 Alpha', 'Midjourney v6', 'ComfyUI Character LoRA', 'Topaz Video AI'],
    'Initial worldbuilding and character turnaround sheets synthesized in Midjourney v6. Generated 14 distinct motion sequences in Runway Gen-3.',
    'cleared'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Lost Orbit: Deep Space Capsule',
    'Speculative astronaut textile exploration investigating zero-gravity chrome drapery and cosmic atmospheric refraction.',
    '/creators/digital_fashion.jpg',
    'image',
    ARRAY['Midjourney v6', 'ComfyUI Experimental Graph'],
    'Exploratory generative sketch series developed for personal cinematic research into speculative spacesuit textiles.',
    'not_cleared'
) ON CONFLICT (id) DO NOTHING;

-- 2. Marcus Sterling
INSERT INTO public.profiles (id, role, display_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'creator',
    'Marcus Sterling',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.creator_profiles (
    user_id, headline, bio, specialization, skills, ai_tools, availability, cover_url, starting_price, is_demo_seed
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Generative Advertising & Brand Visual Specialist',
    'Creates high-converting AI commercial spots, hyper-realistic product renders, and branded visual worlds with strict IP clearance and trademark-safe pipelines.',
    'Product Ads',
    ARRAY['Commercial Prompting', 'Product Staging', 'Diffusion Lighting', 'Upscaling & Finishing', 'Creative Direction'],
    ARRAY['Midjourney v6', 'Flux.1', 'Magnific AI', 'Stable Diffusion XL', 'Photoshop GenFill'],
    'Available Now',
    '/creators/perfume_ad.jpg',
    1800,
    TRUE
) ON CONFLICT (user_id) DO UPDATE SET
    headline = EXCLUDED.headline,
    bio = EXCLUDED.bio,
    specialization = EXCLUDED.specialization,
    skills = EXCLUDED.skills,
    ai_tools = EXCLUDED.ai_tools,
    availability = EXCLUDED.availability,
    cover_url = EXCLUDED.cover_url;

INSERT INTO public.portfolio_items (
    id, creator_id, title, description, media_url, media_type, tools_used, workflow_description, commercial_use_status
) VALUES 
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Ethereal Essence: Luxury Fragrance Campaign',
    'Commercial still campaign for a luxury fragrance brand showcasing sculpted glass flacons amidst botanical refractions.',
    '/creators/perfume_ad.jpg',
    'ad',
    ARRAY['Flux.1 Pro', 'Midjourney v6', 'Magnific AI', 'Photoshop'],
    'Synthesized with Flux.1 Pro utilizing controlled glass caustics lighting prompts. Multi-pass upscaling performed in Magnific AI.',
    'cleared'
) ON CONFLICT (id) DO NOTHING;

-- 3. Sophia Chen
INSERT INTO public.profiles (id, role, display_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'creator',
    'Sophia Chen',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.creator_profiles (
    user_id, headline, bio, specialization, skills, ai_tools, availability, cover_url, starting_price, is_demo_seed
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'AI Character Animator & World Designer',
    'Brings fantastical worlds to life through motion-consistent AI animation, fluid camera movement, and stylized aesthetic direction for music videos and title sequences.',
    'Animation',
    ARRAY['Character Animation', 'Motion Control', 'Stylized Worlds', 'Temporal Coherence', 'Music Video Direction'],
    ARRAY['Luma Dream Machine', 'Kling AI', 'Runway Gen-3', 'AnimateDiff', 'ComfyUI'],
    'Booking Next Month',
    '/creators/character_cyber.jpg',
    3200,
    TRUE
) ON CONFLICT (user_id) DO UPDATE SET
    headline = EXCLUDED.headline,
    bio = EXCLUDED.bio,
    specialization = EXCLUDED.specialization,
    skills = EXCLUDED.skills,
    ai_tools = EXCLUDED.ai_tools,
    availability = EXCLUDED.availability,
    cover_url = EXCLUDED.cover_url;

INSERT INTO public.portfolio_items (
    id, creator_id, title, description, media_url, media_type, tools_used, workflow_description, commercial_use_status
) VALUES 
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Neon Shinjuku: Android Awakening',
    'Cyberpunk narrative sequence following a cybernetic street samurai navigating holographic rain-slicked alleyways.',
    '/creators/character_cyber.jpg',
    'animation',
    ARRAY['Kling AI 1.5', 'ComfyUI AnimateDiff', 'Topaz Video AI'],
    'Choreographed using AnimateDiff motion modules in ComfyUI with high temporal coherence. Post-processed through Topaz Video AI.',
    'cleared'
) ON CONFLICT (id) DO NOTHING;

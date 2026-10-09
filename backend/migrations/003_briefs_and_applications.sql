-- ============================================================================
-- Crevo AI Creator Marketplace — Supabase Database Migration
-- Version: 003_briefs_and_applications.sql
-- Description: Tables, indexes, and RLS policies for Creative Briefs and Creator Applications
-- ============================================================================

-- ============================================================================
-- 1. Creative Briefs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    description TEXT NOT NULL,
    creative_objective TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'animation', 'image', 'ad', 'graphic_design')),
    visual_style TEXT,
    aspect_ratio TEXT DEFAULT '16:9',
    duration TEXT,
    ai_tools_preferred TEXT[] NOT NULL DEFAULT '{}',
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    budget_min INTEGER,
    budget_max INTEGER,
    currency TEXT NOT NULL DEFAULT 'USD',
    deadline DATE,
    commercial_use_requirements TEXT,
    licensing_expectations TEXT,
    revision_expectations TEXT DEFAULT '2 rounds of generative iterations included',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.briefs IS 'Creative briefs posted by brands and agencies seeking AI creators.';

-- ============================================================================
-- 2. Brief Applications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brief_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    proposed_rate INTEGER,
    portfolio_item_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_creator_application_per_brief UNIQUE (brief_id, creator_id)
);

COMMENT ON TABLE public.brief_applications IS 'Proposals and applications submitted by AI creators for creative briefs.';

-- ============================================================================
-- 3. Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_briefs_owner_id ON public.briefs(owner_id);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs(status);
CREATE INDEX IF NOT EXISTS idx_briefs_content_type ON public.briefs(content_type);
CREATE INDEX IF NOT EXISTS idx_briefs_ai_tools_preferred ON public.briefs USING GIN (ai_tools_preferred);
CREATE INDEX IF NOT EXISTS idx_brief_applications_brief_id ON public.brief_applications(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_applications_creator_id ON public.brief_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_brief_applications_status ON public.brief_applications(status);

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_applications ENABLE ROW LEVEL SECURITY;

-- BRIEFS Policies
-- Published briefs are readable by everyone; drafts only by the owner
DROP POLICY IF EXISTS "Public can view published briefs" ON public.briefs;
CREATE POLICY "Public can view published briefs"
    ON public.briefs FOR SELECT
    USING (status != 'draft' OR auth.uid() = owner_id);

-- Brands can create briefs
DROP POLICY IF EXISTS "Brands can create briefs" ON public.briefs;
CREATE POLICY "Brands can create briefs"
    ON public.briefs FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own briefs
DROP POLICY IF EXISTS "Owners can update own briefs" ON public.briefs;
CREATE POLICY "Owners can update own briefs"
    ON public.briefs FOR UPDATE
    USING (auth.uid() = owner_id);

-- Owners can delete their own briefs
DROP POLICY IF EXISTS "Owners can delete own briefs" ON public.briefs;
CREATE POLICY "Owners can delete own briefs"
    ON public.briefs FOR DELETE
    USING (auth.uid() = owner_id);

-- BRIEF APPLICATIONS Policies
-- Creators can view their own applications, brief owners can view applications on their briefs
DROP POLICY IF EXISTS "Applications viewable by creator or brief owner" ON public.brief_applications;
CREATE POLICY "Applications viewable by creator or brief owner"
    ON public.brief_applications FOR SELECT
    USING (
        auth.uid() = creator_id OR
        EXISTS (SELECT 1 FROM public.briefs WHERE briefs.id = brief_applications.brief_id AND briefs.owner_id = auth.uid())
    );

-- Creators can submit applications to published briefs
DROP POLICY IF EXISTS "Creators can submit applications" ON public.brief_applications;
CREATE POLICY "Creators can submit applications"
    ON public.brief_applications FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (SELECT 1 FROM public.briefs WHERE briefs.id = brief_applications.brief_id AND briefs.status = 'published')
    );

-- Creators can update their own pending proposals; brief owners can update application status
DROP POLICY IF EXISTS "Update application permissions" ON public.brief_applications;
CREATE POLICY "Update application permissions"
    ON public.brief_applications FOR UPDATE
    USING (
        auth.uid() = creator_id OR
        EXISTS (SELECT 1 FROM public.briefs WHERE briefs.id = brief_applications.brief_id AND briefs.owner_id = auth.uid())
    );

-- ============================================================================
-- 5. Seed Initial Demo Brand, Creative Briefs & Creator Applications
-- ============================================================================
-- Seed Demo Brand in auth.users and profiles
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'studio@lumina.crevo',
    crypt('demo1234', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Lumina Creative Studio","role":"brand"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, display_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    'brand',
    'Lumina Creative Studio',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

-- Demo Brief 1: Electric Scooter Campaign
INSERT INTO public.briefs (
    id, owner_id, title, brand_name, description, creative_objective,
    content_type, visual_style, aspect_ratio, duration, ai_tools_preferred,
    deliverables, budget_min, budget_max, currency, deadline,
    commercial_use_requirements, licensing_expectations, revision_expectations, status
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Hyperion Apex: Autonomous Electric Scooter Launch Film',
    'Hyperion Mobility',
    'Create a high-octane 30-second cinematic launch commercial showcasing the Hyperion Apex electric scooter gliding through a rainy neo-cyberpunk metropolis with neon puddle reflections and dynamic camera swoops.',
    'Drive pre-orders among urban tech professionals and position Hyperion as the premium apex of personal electric transit.',
    'video',
    'Neo-noir cyberpunk, high-contrast anamorphic lens flares, rain-slicked asphalt, vibrant violet and teal reflections.',
    '16:9',
    '30 seconds',
    ARRAY['Runway Gen-3', 'Kling AI', 'Midjourney v6', 'Topaz Video AI'],
    ARRAY['1x 30s 4K Master Video (16:9)', '1x 15s Cutdown for Social (9:16)', '5x Key Visual Stills (4K)'],
    3500,
    6000,
    'USD',
    CURRENT_DATE + INTERVAL '21 days',
    'Full commercial buyout with worldwide digital and broadcast rights across web, social, and CTV.',
    'Perpetual exclusive commercial license for all generated deliverables and final cut.',
    '3 rounds of storyboard & generative prompt revisions included.',
    'published'
) ON CONFLICT (id) DO NOTHING;

-- Demo Brief 2: Luxury Perfume Ad
INSERT INTO public.briefs (
    id, owner_id, title, brand_name, description, creative_objective,
    content_type, visual_style, aspect_ratio, duration, ai_tools_preferred,
    deliverables, budget_min, budget_max, currency, deadline,
    commercial_use_requirements, licensing_expectations, revision_expectations, status
) VALUES (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'Aura Botanica: Bioluminescent Fragrance Campaign',
    'Maison de L''Ombre',
    'Develop an ethereal advertising campaign featuring crystalline perfume flacons intertwined with luminous deep-jungle flora and bioluminescent dew droplets.',
    'Convey organic luxury and botanical mystique for luxury retail displays and global social rollouts.',
    'ad',
    'Luminous macro realism, dark emerald and soft amber caustics, soft atmospheric bloom, hyper-detailed glass refractions.',
    '4:5',
    NULL,
    ARRAY['Flux.1 Pro', 'Midjourney v6', 'Magnific AI', 'Photoshop GenFill'],
    ARRAY['3x High-Res Campaign Stills (8K print-ready)', '1x 10s Seamless Looping Ambient Motion Poster'],
    2000,
    4000,
    'USD',
    CURRENT_DATE + INTERVAL '14 days',
    'Global commercial advertising and print catalog rights.',
    'Perpetual non-exclusive worldwide rights.',
    '2 rounds of revisions.',
    'published'
) ON CONFLICT (id) DO NOTHING;

-- Demo Application 1: Elena Vance applying to Scooter brief
INSERT INTO public.brief_applications (
    id, brief_id, creator_id, proposal, proposed_rate, portfolio_item_ids, status
) VALUES (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'I specialize in cinematic narrative sci-fi directing using Runway Gen-3 and Kling AI. I can deliver multi-angle camera tracking and pristine character consistency for the Hyperion Apex sequence with custom sound design.',
    4800,
    ARRAY['10000000-0000-0000-0000-000000000001'::uuid],
    'shortlisted'
) ON CONFLICT (id) DO NOTHING;

-- Demo Application 2: Marcus Sterling applying to Perfume brief
INSERT INTO public.brief_applications (
    id, brief_id, creator_id, proposal, proposed_rate, portfolio_item_ids, status
) VALUES (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'I have proven experience in high-end luxury cosmetic staging using Flux.1 and Magnific upscaling. Please see my Ethereal Essence campaign in my portfolio for direct proof of glass caustic realism.',
    2800,
    ARRAY['10000000-0000-0000-0000-000000000003'::uuid],
    'pending'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Crevo AI Creator Marketplace — Supabase Database Migration
-- Version: 001_initial_schema.sql
-- Description: Core tables, foreign keys, constraints, indexes, and RLS policies
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Profiles Table (Extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('creator', 'brand')),
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS 'User identity and marketplace role mapped to Supabase auth accounts.';

-- ============================================================================
-- 2. Creator Profiles Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    specialization TEXT NOT NULL DEFAULT 'AI Art',
    skills TEXT[] NOT NULL DEFAULT '{}',
    ai_tools TEXT[] NOT NULL DEFAULT '{}',
    availability TEXT NOT NULL DEFAULT 'Available Now',
    cover_url TEXT,
    starting_price INTEGER DEFAULT 1500,
    price_unit TEXT DEFAULT 'project',
    location TEXT DEFAULT 'Global',
    is_demo_seed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.creator_profiles IS 'Detailed creator credentials, tooling, and specializations.';

-- ============================================================================
-- 3. Portfolio Items Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('video', 'animation', 'ad', 'image')),
    tools_used TEXT[] NOT NULL DEFAULT '{}',
    workflow_description TEXT,
    commercial_use_status TEXT NOT NULL DEFAULT 'not_cleared' CHECK (commercial_use_status IN ('cleared', 'restricted', 'not_cleared')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.portfolio_items IS 'Generative AI projects, media previews, workflow logs, and commercial licenses.';

-- ============================================================================
-- 4. Performance & Search Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_specialization ON public.creator_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_availability ON public.creator_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_ai_tools ON public.creator_profiles USING GIN (ai_tools);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_creator_id ON public.portfolio_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_media_type ON public.portfolio_items(media_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_commercial_status ON public.portfolio_items(commercial_use_status);

-- ============================================================================
-- 5. Automatic Profile Trigger on Auth Signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'creator'),
        new.raw_user_meta_data->>'avatar_url'
    );
    
    -- If user registered as creator, initialize an empty creator profile record
    IF (COALESCE(new.raw_user_meta_data->>'role', 'creator') = 'creator') THEN
        INSERT INTO public.creator_profiles (user_id, headline, bio, specialization)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'headline', 'AI Creator'),
            'AI Creator on Crevo.',
            COALESCE(new.raw_user_meta_data->>'specialization', 'AI Art')
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users (runs automatically upon Supabase signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES RLS Policies
-- ----------------------------------------------------------------------------
-- Public can read any user profile
DROP POLICY IF EXISTS "Public profiles are readable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by anyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- CREATOR_PROFILES RLS Policies
-- ----------------------------------------------------------------------------
-- Anyone can view creator profiles
DROP POLICY IF EXISTS "Creator profiles are publicly viewable" ON public.creator_profiles;
CREATE POLICY "Creator profiles are publicly viewable"
    ON public.creator_profiles FOR SELECT
    USING (true);

-- Creators can insert their own creator profile
DROP POLICY IF EXISTS "Creators can insert their own creator profile" ON public.creator_profiles;
CREATE POLICY "Creators can insert their own creator profile"
    ON public.creator_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Creators can update only their own creator profile
DROP POLICY IF EXISTS "Creators can update their own profile" ON public.creator_profiles;
CREATE POLICY "Creators can update their own profile"
    ON public.creator_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PORTFOLIO_ITEMS RLS Policies
-- ----------------------------------------------------------------------------
-- Anyone can view portfolio items
DROP POLICY IF EXISTS "Portfolio items are publicly viewable" ON public.portfolio_items;
CREATE POLICY "Portfolio items are publicly viewable"
    ON public.portfolio_items FOR SELECT
    USING (true);

-- Creators can insert portfolio items for themselves
DROP POLICY IF EXISTS "Creators can publish portfolio items" ON public.portfolio_items;
CREATE POLICY "Creators can publish portfolio items"
    ON public.portfolio_items FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Creators can update only their own portfolio items
DROP POLICY IF EXISTS "Creators can update their own portfolio items" ON public.portfolio_items;
CREATE POLICY "Creators can update their own portfolio items"
    ON public.portfolio_items FOR UPDATE
    USING (auth.uid() = creator_id);

-- Creators can delete only their own portfolio items
DROP POLICY IF EXISTS "Creators can delete their own portfolio items" ON public.portfolio_items;
CREATE POLICY "Creators can delete their own portfolio items"
    ON public.portfolio_items FOR DELETE
    USING (auth.uid() = creator_id);

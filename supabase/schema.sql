-- ====================================================================
-- UnSpoken — PostgreSQL Database Schema for Supabase
-- A place for everything left unsaid.
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. THOUGHTS TABLE
CREATE TABLE IF NOT EXISTS public.thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 3 AND char_length(content) <= 100000),
    content_hash TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'unspoken',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'held', 'removed')),
    deletion_token_hash TEXT NOT NULL,
    is_duplicate_acknowledged BOOLEAN NOT NULL DEFAULT false,
    reactions_count JSONB NOT NULL DEFAULT '{"hear_you": 0, "not_alone": 0, "warmth": 0, "understand": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast feed queries and duplicate detection
CREATE INDEX IF NOT EXISTS idx_thoughts_status_created ON public.thoughts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_category ON public.thoughts(category, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_thoughts_content_hash ON public.thoughts(content_hash);

-- 2. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thought_id UUID NOT NULL REFERENCES public.thoughts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('hear_you', 'not_alone', 'warmth', 'understand')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reactions_thought_id ON public.reactions(thought_id);

-- 3. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thought_id UUID NOT NULL REFERENCES public.thoughts(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('harassment', 'threats', 'harmful_encouragement', 'spam', 'privacy_violation', 'other')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);

-- 4. MODERATION EVENTS TABLE (Audit Log)
CREATE TABLE IF NOT EXISTS public.moderation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thought_id UUID NOT NULL,
    moderation_category TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'held', 'removed', 'dismissed')),
    notes TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_reviewed ON public.moderation_events(reviewed_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;

-- Thoughts Policies:
-- Public can view published thoughts (excluding deletion_token_hash via views/restricted projection)
CREATE POLICY "Public can view published thoughts"
    ON public.thoughts FOR SELECT
    USING (status = 'published');

-- Server-side service role has full access
CREATE POLICY "Service role full access on thoughts"
    ON public.thoughts FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Reactions Policies:
-- Public can view reaction counts and insert reactions
CREATE POLICY "Public can view reactions"
    ON public.reactions FOR SELECT
    USING (true);

CREATE POLICY "Public can insert reactions"
    ON public.reactions FOR INSERT
    WITH CHECK (true);

-- Reports Policies:
-- Public can insert reports, but cannot read other people's reports
CREATE POLICY "Public can insert reports"
    ON public.reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role full access on reports"
    ON public.reports FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Moderation Events Policies:
CREATE POLICY "Service role full access on moderation events"
    ON public.moderation_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ====================================================================
-- STORED FUNCTIONS: Increment reaction count safely
-- ====================================================================

CREATE OR REPLACE FUNCTION public.increment_reaction(p_thought_id UUID, p_reaction_type TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.thoughts
    SET reactions_count = jsonb_set(
        reactions_count,
        ARRAY[p_reaction_type],
        to_jsonb(COALESCE((reactions_count->>p_reaction_type)::int, 0) + 1)
    )
    WHERE id = p_thought_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

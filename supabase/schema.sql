-- ==============================================================================
-- TAWDHEEF TN (توظيف تونس) - Database Schema
-- Production PostgreSQL / Supabase Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. SOURCES TABLE (Recruitment Sources Registry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    source_type VARCHAR(64) NOT NULL CHECK (source_type IN (
        'official_government',
        'official_ministry',
        'public_competition',
        'education_authority',
        'company',
        'employment_platform',
        'api_feed',
        'rss_feed',
        'manual_verified'
    )),
    active BOOLEAN NOT NULL DEFAULT true,
    requires_verification BOOLEAN NOT NULL DEFAULT false,
    last_checked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. JOBS TABLE (Recruitment Opportunities & Concours)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    organization VARCHAR(255),
    description TEXT NOT NULL,
    academic_section VARCHAR(128) NOT NULL, -- e.g. computer_science, mathematics, economics, law, etc.
    education_level VARCHAR(64) NOT NULL,   -- e.g. secondary, bac, bts, licence, master, engineer, phd, other
    professional_category VARCHAR(128) NOT NULL, -- e.g. private_employment, public_concours, teaching, internship, etc.
    sector VARCHAR(64) NOT NULL CHECK (sector IN ('public', 'private', 'teaching', 'other')),
    job_type VARCHAR(64) NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'civil_service', 'internship', 'freelance')),
    governorates TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- e.g. ['Tunis', 'Sousse'] or ['all_tunisia']
    location VARCHAR(255),
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    vacancies_count INT DEFAULT 1,
    publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_deadline DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'closed', 'pending_verification')),
    verification_status VARCHAR(32) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
    source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    application_url TEXT NOT NULL,
    import_batch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE (User Preferences & Academic Profile)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    academic_section VARCHAR(128),
    education_level VARCHAR(64),
    preferred_job_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_governorates TEXT[] DEFAULT ARRAY[]::TEXT[],
    professional_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    notification_preferences JSONB DEFAULT '{"email": false, "in_app": true, "new_matching_job": true, "deadline_reminder": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. USER ROLES TABLE (RBAC for Admins & Moderators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role)
);

-- ------------------------------------------------------------------------------
-- 5. FAVORITES TABLE (Saved Opportunities)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, job_id)
);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE (In-app Personalized Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. IMPORT LOGS TABLE (Ingestion Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
    import_type VARCHAR(32) NOT NULL CHECK (import_type IN ('api', 'rss', 'json', 'csv', 'manual')),
    items_found INT NOT NULL DEFAULT 0,
    items_imported INT NOT NULL DEFAULT 0,
    duplicates_detected INT NOT NULL DEFAULT 0,
    errors_count INT NOT NULL DEFAULT 0,
    error_details JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_sector ON public.jobs(sector);
CREATE INDEX IF NOT EXISTS idx_jobs_academic_section ON public.jobs(academic_section);
CREATE INDEX IF NOT EXISTS idx_jobs_education_level ON public.jobs(education_level);
CREATE INDEX IF NOT EXISTS idx_jobs_professional_category ON public.jobs(professional_category);
CREATE INDEX IF NOT EXISTS idx_jobs_governorates ON public.jobs USING GIN(governorates);
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills ON public.jobs USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_publication_date ON public.jobs(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_application_deadline ON public.jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);

-- ------------------------------------------------------------------------------
-- AUTOMATIC EXPIRATION TRIGGER & FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_job_expirations()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs
    SET status = 'expired',
        updated_at = timezone('utc'::text, now())
    WHERE status = 'active'
      AND application_deadline IS NOT NULL
      AND application_deadline < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    );
    -- Default role: user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- JOBS POLICIES:
-- 1. Anyone (public anonymous & authenticated) can view active & verified jobs
CREATE POLICY "Public can view active verified jobs"
    ON public.jobs FOR SELECT
    USING (status = 'active' AND verification_status = 'verified');

-- 2. Admins can view and manage all jobs
CREATE POLICY "Admins can do everything on jobs"
    ON public.jobs FOR ALL
    USING (public.is_admin());

-- SOURCES POLICIES:
-- 1. Public can view active sources
CREATE POLICY "Public can view active sources"
    ON public.sources FOR SELECT
    USING (active = true);

-- 2. Admins can manage all sources
CREATE POLICY "Admins can do everything on sources"
    ON public.sources FOR ALL
    USING (public.is_admin());

-- PROFILES POLICIES:
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- USER ROLES POLICIES:
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin());

-- FAVORITES POLICIES:
CREATE POLICY "Users can manage own favorites"
    ON public.favorites FOR ALL
    USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES:
CREATE POLICY "Users can view and update own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- IMPORT LOGS POLICIES:
CREATE POLICY "Admins can view and manage import logs"
    ON public.import_logs FOR ALL
    USING (public.is_admin());

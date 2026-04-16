-- =============================================
-- Flightplan Supabase Migration Script
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    academy text,
    role_current text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_flight_agent boolean DEFAULT false
);

-- 2. Boarding passes table
CREATE TABLE IF NOT EXISTS boarding_passes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    origin_role text NOT NULL,
    dest_role text NOT NULL,
    time_in_role text,
    time_at_lat text,
    quals text[] DEFAULT '{}',
    exps text[] DEFAULT '{}',
    route_data jsonb DEFAULT '{}',
    share_token text UNIQUE DEFAULT gen_random_uuid()::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Milestone progress table
CREATE TABLE IF NOT EXISTS milestone_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_pass_id uuid REFERENCES boarding_passes(id) ON DELETE CASCADE NOT NULL,
    leg_index integer NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamptz,
    notes text,
    UNIQUE(boarding_pass_id, leg_index)
);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
-- Users can read/update their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Flight Agents can view all profiles
CREATE POLICY "Flight agents can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_flight_agent = true
        )
    );

-- 6. RLS Policies for boarding_passes
-- Users can CRUD their own passes
CREATE POLICY "Users can view own passes"
    ON boarding_passes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passes"
    ON boarding_passes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passes"
    ON boarding_passes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passes"
    ON boarding_passes FOR DELETE
    USING (auth.uid() = user_id);

-- Flight Agents can view all passes
CREATE POLICY "Flight agents can view all passes"
    ON boarding_passes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_flight_agent = true
        )
    );

-- Anyone can view a pass via share token (for shared links)
CREATE POLICY "Anyone can view shared passes"
    ON boarding_passes FOR SELECT
    USING (share_token IS NOT NULL);

-- 7. RLS Policies for milestone_progress
CREATE POLICY "Users can manage own milestones"
    ON milestone_progress FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM boarding_passes
            WHERE boarding_passes.id = milestone_progress.boarding_pass_id
            AND boarding_passes.user_id = auth.uid()
        )
    );

CREATE POLICY "Flight agents can view all milestones"
    ON milestone_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_flight_agent = true
        )
    );

-- 8. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER boarding_passes_updated_at
    BEFORE UPDATE ON boarding_passes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 10. Index for share token lookups
CREATE INDEX IF NOT EXISTS idx_boarding_passes_share_token
    ON boarding_passes(share_token);

CREATE INDEX IF NOT EXISTS idx_boarding_passes_user_id
    ON boarding_passes(user_id);

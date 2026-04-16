-- =============================================
-- Flightplan Migration 2: Flight Agent Notes
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Agent notes table — one note per boarding pass, editable by flight agents only
CREATE TABLE IF NOT EXISTS agent_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_pass_id uuid REFERENCES boarding_passes(id) ON DELETE CASCADE NOT NULL,
    agent_id uuid REFERENCES profiles(id) NOT NULL,
    recommendations text DEFAULT '',
    next_steps text DEFAULT '',
    general_notes text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(boarding_pass_id)
);

-- 2. Enable RLS
ALTER TABLE agent_notes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Flight agents can do everything with notes
CREATE POLICY "Flight agents can manage all notes"
    ON agent_notes FOR ALL
    USING (public.is_flight_agent());

-- Users can read notes on their own boarding passes
CREATE POLICY "Users can view notes on own passes"
    ON agent_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM boarding_passes
            WHERE boarding_passes.id = agent_notes.boarding_pass_id
            AND boarding_passes.user_id = auth.uid()
        )
    );

-- Anyone with a share token can see notes on shared passes
CREATE POLICY "Shared pass notes are viewable"
    ON agent_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM boarding_passes
            WHERE boarding_passes.id = agent_notes.boarding_pass_id
            AND boarding_passes.share_token IS NOT NULL
        )
    );

-- 4. Auto-update timestamp
CREATE TRIGGER agent_notes_updated_at
    BEFORE UPDATE ON agent_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_agent_notes_boarding_pass_id
    ON agent_notes(boarding_pass_id);

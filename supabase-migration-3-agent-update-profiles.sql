-- =============================================
-- Flightplan Migration 3: Allow Flight Agents to update profiles
-- Run this in your Supabase SQL Editor
-- =============================================

-- Flight agents can update any profile (needed for toggling flight agent status)
CREATE POLICY "Flight agents can update all profiles"
    ON profiles FOR UPDATE
    USING (public.is_flight_agent());

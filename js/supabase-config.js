// ===== Supabase Configuration =====
// Replace these with your Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Import and init (loaded via CDN in HTML pages)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// This gives us window.supabase

let _supabaseClient = null;

function getSupabase() {
    if (!_supabaseClient) {
        _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
}

// ===== Auth Helpers =====
async function getCurrentUser() {
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

async function getUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSupabase();
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
    return data;
}

async function isFlightAgent() {
    const profile = await getUserProfile();
    return profile?.is_flight_agent === true;
}

async function signInWithMagicLink(email) {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/my-flightplan.html' }
    });
    return { error };
}

async function signOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
    window.location.href = 'index.html';
}

// ===== Profile Helpers =====
async function updateProfile(updates) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not logged in' };
    const sb = getSupabase();
    const { data, error } = await sb.from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
    return { data, error };
}

// ===== Boarding Pass Helpers =====
async function saveBoardingPass(passData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not logged in' };
    const sb = getSupabase();
    const { data, error } = await sb.from('boarding_passes')
        .insert({
            user_id: user.id,
            current_role: passData.currentRole,
            dest_role: passData.destRole,
            time_in_role: passData.timeInRole,
            time_at_lat: passData.timeAtLAT,
            quals: passData.quals,
            exps: passData.exps,
            route_data: passData.routeData
        })
        .select()
        .single();
    return { data, error };
}

async function getUserPasses() {
    const user = await getCurrentUser();
    if (!user) return [];
    const sb = getSupabase();
    const { data } = await sb.from('boarding_passes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    return data || [];
}

async function deleteBoardingPass(passId) {
    const sb = getSupabase();
    const { error } = await sb.from('boarding_passes').delete().eq('id', passId);
    return { error };
}

async function getPassByShareToken(token) {
    const sb = getSupabase();
    const { data } = await sb.from('boarding_passes')
        .select('*, profiles(full_name, academy)')
        .eq('share_token', token)
        .single();
    return data;
}

// ===== Flight Agent Helpers =====
async function getAllUsers() {
    const sb = getSupabase();
    const { data } = await sb.from('profiles')
        .select('*, boarding_passes(count)')
        .order('full_name');
    return data || [];
}

async function getUserPassesById(userId) {
    const sb = getSupabase();
    const { data } = await sb.from('boarding_passes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return data || [];
}

// ===== Nav Auth State =====
async function updateNavForAuth() {
    const user = await getCurrentUser();
    const signInLinks = document.querySelectorAll('.header__sign-in');
    const agentLinks = document.querySelectorAll('.nav-agent-link');

    if (user) {
        const profile = await getUserProfile();
        signInLinks.forEach(link => {
            link.textContent = 'My Flightplan';
            link.href = 'my-flightplan.html';
        });
        if (profile?.is_flight_agent) {
            agentLinks.forEach(link => link.style.display = '');
        }
    }
}

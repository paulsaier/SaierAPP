const SUPABASE_URL = "https://tbcfghiegcmibwlvmfto.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vwsOlVybuHzRnL8Gh0zIIA_IntNTo4_";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
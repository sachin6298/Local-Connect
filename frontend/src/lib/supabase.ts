import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are
 * present and non-empty. Used throughout the app to gate live Supabase calls
 * so the application still functions (with demo data) when credentials are
 * not yet configured.
 */
export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl && supabaseUrl.startsWith("https://")) &&
  Boolean(supabaseAnonKey && supabaseAnonKey.length > 20);

/**
 * Singleton Supabase client.
 *
 * When Supabase is not configured (development / demo mode) we create a
 * no-op placeholder client pointed at a localhost URL so imports never throw.
 * None of its methods are called unless `isSupabaseConfigured` is true.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key-not-configured",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  }
);


import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env.js";

let _adminClient: SupabaseClient | null = null;

/**
 * Get a Supabase client with service-role key.
 * Used for DB operations that bypass RLS.
 */
export const getAdminClient = (): SupabaseClient => {
  if (!_adminClient) {
    const env = getEnv();
    _adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _adminClient;
};

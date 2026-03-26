import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      env.supabaseUrl,
      env.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabase;
}

export { supabase };

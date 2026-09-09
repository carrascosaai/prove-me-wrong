import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./env";

let readClient: SupabaseClient | null = null;
let writeClient: SupabaseClient | null = null;

/** Anon client — respects RLS, safe for read paths. */
export function supabaseRead(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase read client requested without configuration");
  }
  readClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  return readClient;
}

/** Service-role client — bypasses RLS. Server-only, used for writes. */
export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin client requested without configuration");
  }
  writeClient ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return writeClient;
}
